const express = require('express');
const {
    getTour,
    getAllTour,
    createTour,
    deleteTour,
    updateTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
} = require('../controllers/TourController');
const {
    protects,
    restrictTo,
} = require('../controllers/authenticationController');
const reviewRouter = require('../routes/ReviewRoutes');

const router = express.Router();

// router.param('id', checkId);

//Nested Route
// POST tour/:tourId/reviews
// GET tour/:tourId/reviews
// GET tour/:tourId/reviews/:reviewId

router.use(`/:tourId/reviews`, reviewRouter);

router.route(`/tour-stats`).get(getTourStats);

router
    .route(`/monthly-plan/:year`)
    .get(protects, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route(`/top-5-cheap`).get(aliasTopTours, getAllTour);

router
    .route(`/tours-within/:distance/center/:latlng/unit/:unit`)
    .get(getToursWithin);

router.route(`/distances/:latlng/unit/:unit`).get(getDistances);

router
    .route(`/`)
    .get(getAllTour)
    .post(protects, restrictTo('admin', 'lead-guide'), createTour);

router
    .route(`/:id`)
    .get(getTour)
    .patch(protects, restrictTo('admin', 'lead-guide'), updateTour)
    .delete(protects, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
