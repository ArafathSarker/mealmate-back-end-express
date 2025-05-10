const express = require('express');
const route = express.Router();
const passport = require('passport');
const controller = require('../controller/users.control');

route.post('/signup',controller.users_signup_control);
route.post('/login',controller.users_login_control);
route.get('/dashboard',passport.authenticate('jwt', { session: false }),controller.users_dashboard_control);
route.post('/group/user/:username',controller.users_group_control);
route.post('/group/adduser',controller.addUser_group_control);
route.post('/group/check/user',controller.check_user_control);
route.post('/data/group',controller.fetch_group_data_control);
route.post('/data/groupuser',controller.fetch_group_user_data_control);
route.post('/data/updatedeposit', controller.update_deposit_control);
route.post('/data/updatemeals',controller.update_meal_control);
route.post('/data/updateaddcost',controller.add_cost_control);
route.post('/data/cleardue',controller.clear_due_control);
module.exports = route;