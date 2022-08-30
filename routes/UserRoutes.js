const express = require('express');

const {
    getUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto,
} = require('../controllers/UserController');
const {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protects,
    restrictTo,
    logout,
} = require('../controllers/authenticationController');

const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', login);
Router.get('/logout', logout);

Router.post('/forgotPassword', forgotPassword);
Router.patch('/resetPassword/:token', resetPassword);

// Everyone should be be logged in: Protect All routes

Router.use(protects);

Router.patch('/updateMyPassword', updatePassword);

Router.get('/me', getMe, getUser);
Router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
Router.delete('/deleteMe', deleteMe);

// Only Admin has access to the following Routes

Router.use(restrictTo('admin'));

Router.route(`/`).get(getAllUsers).post(createUser);
Router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = Router;
