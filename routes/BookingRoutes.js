const express = require('express');

const {
    getCheckoutSession,
    getAllBooking,
    getOneBooking,
    createBooking,
    updateOneBooking,
    deleteOneBooking,
} = require('../controllers/bookingController');
const {
    protects,
    restrictTo,
} = require('../controllers/authenticationController');

const router = express.Router();
router.use(protects);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBooking).post(createBooking);
router
    .route('/:id')
    .get(getOneBooking)
    .patch(updateOneBooking)
    .delete(deleteOneBooking);

module.exports = router;
