const express = require('express');

const {
    getUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
} = require('../controllers/UserController');
const {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protects,
} = require('../controllers/authenticationController');

const Router = express.Router();

Router.post('/signup', signUp);
Router.post('/login', login);

Router.post('/forgotPassword', forgotPassword);
Router.patch('/resetPassword/:token', resetPassword);

Router.patch('/updateMyPassword', protects, updatePassword);

Router.patch('/updateMe', protects, updateMe);
Router.delete('/deleteMe', protects, deleteMe);

Router.route(`/`).get(getAllUsers).post(createUser);
Router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = Router;
