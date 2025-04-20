const mongoose = require("mongoose");
const signupSchema = new mongoose.Schema({
     username : {
        type:String,
        required:[true,"Please assign a value in Username field"],
        maxLenght:[30,"Your username is too long"],
        minLength:[4,"your username is too short"],
        trim:true,
        unique:true
     },
     email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, 
        lowercase: true, 
        trim: true 
      },
      password: {
        type: String,
        required: [true, 'Password is required'],

      },
      createdOn:{
        type:Date,
        default:Date.now()
  }

});

module.exports = new mongoose.model("users_signup_data",signupSchema);