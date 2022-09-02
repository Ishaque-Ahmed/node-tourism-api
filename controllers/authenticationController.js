const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');
const Email = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createAndSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangeAt: req.body.passwordChangeAt,
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, 201, req, res);
    // const token = signToken(newUser._id);
    // res.status(201).json({
    //     status: 'Success',
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) user exists? passwords correct?
    const user = await User.findOne({ email }).select('+password');
    // const correct = await user.correctPassword(password, user.password);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email or Password', 401));
    }

    // 3)  if 1 and 2 => send token
    createAndSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'logging out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

exports.protects = catchAsync(async (req, res, next) => {
    // 1) Getting Token and see if it exists

    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // console.log(token);
    if (!token)
        return next(
            new AppError(
                'You are not logged in, Please login to get access',
                401
            )
        );

    // 2) Verification Token

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    // 3) Whether User Exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
        return next(
            new AppError(
                'The user bolonging the token is no longer exists',
                401
            )
        );

    // 4) Check if User has changed passwords after getting token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password, Please login again',
                401
            )
        );
    }

    // Grant access;
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles" 'admin' 'lead-guide'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to access this route',
                    403
                )
            );
        }
        next();
    };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get User based on posted Email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('No user with this email', 404));

    // 2) Generate random Token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email

    // const message = `Forgot your password? submit a new patch request with your new password and confirm password to ${resetURL}. \n If you did not forget your password please ignore`;
    try {
        // await sendEmails({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 mnts)',
        //     message,
        // });
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token send to the email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError(
                'There was an error sending the email, try again later',
                500
            )
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() },
    });
    // console.log(user);

    // 2) if token has not expired and user exists => set new password
    if (!user) return next(new AppError('Token is invalid or expired', 400));
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save();

    // 3) update chnagedPasswordAt property

    // 4) Login the user, send JWT
    createAndSendToken(user, 200, req, res);

    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get User from the collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Posted password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Your given password is wrong', 401));
    }

    // 3) Update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();
    //User.findByIdAndUpdate will not work -> validation and pre hooks

    // 4) Log the user in with new password send JWT
    createAndSendToken(user, 200, req, res);
});

// Only for rendering pages // Rendered pages
exports.isLoggedin = async (req, res, next) => {
    try {
        // 1) Getting Token and see if it exists
        if (req.cookies.jwt) {
            const decoded = await jwt.verify(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );
            // 3) Whether User Exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) return next();

            // 4) Check if User has changed passwords after getting token
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // Logged in User;
            res.locals.user = currentUser;
            return next();
        }
    } catch (err) {
        return next();
    }
    next();
};
