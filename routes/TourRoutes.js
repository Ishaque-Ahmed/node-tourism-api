const express = require('express');

const {
    getTour,
    getAllTour,
    createTour,
    deleteTour,
    updateTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
} = require('../controllers/TourController');

const router = express.Router();

// router.param('id', checkId);

router.route(`/tour-stats`).get(getTourStats);

router.route(`/monthly-plan/:year`).get(getMonthlyPlan);

router.route(`/top-5-cheap`).get(aliasTopTours, getAllTour);

router
    .route(`/`)
    .get(getAllTour)
    .post(createTour);
router
    .route(`/:id`)
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;
