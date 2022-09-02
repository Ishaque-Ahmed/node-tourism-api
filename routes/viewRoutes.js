const express = require('express');
const {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    updateUserData,
    getMyTours,
} = require('../controllers/viewController');
const {
    protects,
    isLoggedin,
} = require('../controllers/authenticationController');

const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();

// router.use(isLoggedin);

router.get('/', createBookingCheckout, isLoggedin, getOverview);

router.get('/tour/:slug', isLoggedin, getTour);

router.get(`/login`, isLoggedin, getLoginForm);

router.get(`/me`, protects, getAccount);

router.get(`/myTours`, protects, getMyTours);

router.post('/submit-user-data', protects, updateUserData);

module.exports = router;
