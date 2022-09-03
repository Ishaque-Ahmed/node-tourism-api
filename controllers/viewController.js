const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// exports.alerts = (req, res, next) => {
//     const { alert } = req.query;
//     if (alert === 'booking') {
//         res.locals.alert =
//             "Your Booking was succesful, Please check your email for confirmation. If your booking doesn't show up here immediately, please come back later!";
//     }
//     next();
// };

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get Tour Data
    const tours = await Tour.find();
    // 2) Build Template
    // 3) Render Template using Tour Data
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour filtering by slug(including reviews and tours)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating, user',
    });
    if (!tour)
        return next(new AppError('There is no tour with that name.', 404));
    // 2) Build Template
    // 3) Render Template using Tour Data
    res.status(200).render('tour', {
        title: `${tour.name}`,
        tour,
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
        )
        .render('login', {
            title: `Login to your account`,
        });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account',
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    // Find all bookings of the user
    const bookings = await Booking.find({ user: req.user.id });

    // find tours with the returned ids
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).render('overview', {
        title: 'My tours',
        tours,
    });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).render('account', {
        title: 'Your Account',
        user: updateUser,
    });
});
