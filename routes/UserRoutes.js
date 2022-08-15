const express = require('express');

const {
    getUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/UserController');

const Router = express.Router();

Router.route(`/`)
    .get(getAllUsers)
    .post(createUser);
Router.route(`/:id`)
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = Router;
