const express = require('express');
const {
    createReview,
    getAllReviews,
    deleteReview,
    updateReview,
    setTourAndUserIds,
    getReview,
} = require('../controllers/reviewController');
const {
    protects,
    restrictTo,
} = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

// Nested Route
// POST tour/:tourId/reviews
// GET tour/:tourId/reviews
// GET tour/:tourId/reviews/:reviewId

router.use(protects);

router
    .route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setTourAndUserIds, createReview);

router
    .route('/:id')
    .get(getReview)
    .delete(restrictTo('user', 'admin'), deleteReview)
    .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
