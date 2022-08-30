const express = require('express');
const {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    updateUserData,
} = require('../controllers/viewController');
const {
    protects,
    isLoggedin,
} = require('../controllers/authenticationController');

const router = express.Router();

// router.use(isLoggedin);

router.get('/', isLoggedin, getOverview);

router.get('/tour/:slug', isLoggedin, getTour);

router.get(`/login`, isLoggedin, getLoginForm);

router.get(`/me`, protects, getAccount);

router.post('/submit-user-data', protects, updateUserData);

module.exports = router;
