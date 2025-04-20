const app = require('./config/server');
const passport = require('passport');
const express = require('express');
require("./config/database");
const cors = require('cors');
const userRoute = require('./routes/users.routes');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(passport.initialize());
require('./config/passport');
app.use(cors());
app.use('/app/mealmate/api',userRoute);
app.use((req,res)=>{
    res.status(404).json({
        message:"Invalid route",
        status:400
    });
});