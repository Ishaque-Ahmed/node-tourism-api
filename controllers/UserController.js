const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create an Error if user post password Data
    if (req.body.password || req.body.confirmPassword) {
        return next(
            new AppError(
                'This route is not for password Update, Please use /updateMyPassword Route',
                400
            )
        );
    }
    // 2) update user document
    // tips cant use user.save because it will run validation
    // so use findbyIdUpdate
    //body.role - > filter the body .. no role, token , no malicious data
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'Success',
        data: {
            user: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'succesfully Deleted',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined, Please Use signup instead',
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do not update Password with this
exports.updateUser = factory.updateOne(User); // Admin
exports.deleteUser = factory.deleteOne(User); // Admin

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();

//     //Send Response
//     res.status(200).json({
//         status: 'Success',
//         results: users.length,
//         data: {
//             users,
//         },
//     });
// });
