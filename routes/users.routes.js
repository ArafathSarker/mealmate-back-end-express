const express = require('express');
const route = express.Router();
const passport = require('passport');
const controller = require('../controller/users.control');
route.post('/signup',controller.users_signup_control);
route.post('/login',controller.users_login_control);
route.get('/dashboard',passport.authenticate('jwt', { session: false }),controller.users_dashboard_control);
module.exports = route;