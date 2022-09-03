const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
// const multer = require('multer');
// const sharp = require('sharp');
// // const APIFeatures = require('../utils/apiFeatures');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = async (req, res, next) => {
    // 1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create Checkout session
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
        expand: ['line_items'],
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${
        //     req.params.tourId
        // }&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get(
            'host'
        )}/myTours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `${req.protocol}://${req.get('host')}/img/tours/${
                                tour.imageCover
                            }`,
                        ],
                    },
                },
            },
        ],
        mode: 'payment',
    });
    // 3) Create Session as response
    res.status(200).json({
        status: 'success',
        session,
    });
};

// exports.createBookingCheckout = async (req, res, next) => {
//     // Temporary , unsecure solution
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next();

//     await Booking.create({
//         tour,
//         user,
//         price,
//     });
//     res.redirect(req.originalUrl.split('?')[0]);
// };
const createBookingsCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;
    await Booking.create({
        tour,
        user,
        price,
    });
};
exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        createBookingsCheckout(event.data.object);
    }
    res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.updateOneBooking = factory.updateOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
