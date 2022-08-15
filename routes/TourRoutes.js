const express = require('express');

const {
    getTour,
    getAllTour,
    createTour,
    deleteTour,
    updateTour
} = require('../controllers/TourController');

const router = express.Router();

// router.param('id', checkId);

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
