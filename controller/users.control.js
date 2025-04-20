const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config();
//mongoose schema model
const User = require('../model/users.signupSchema');
//Storing the signup data using bcrypt in the mongodb
const users_signup_control= async (req,res) =>{
    try{
        const user = await User.findOne({username:req.body.username});
        if(user){
          return  res.status(404).send({
                message:"User already registered",
                status:400
            });
        }
        else{
            bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
                const setUser = User({
                    username:req.body.username,
                    email:req.body.email,
                    password:hash
                });
                await setUser.save();
                return res.status(201).json({message:"signup sucessfull",status:201});
            });
           
        }
    }
    catch(err)
    {
       return res.status(500).send({
            message:"Sorry! Server error",
            status:500
        })
    }
}
//user login control route configaration
const users_login_control = async (req,res)=>{
    try{
        const user = await User.findOne({username:req.body.username});
        if(!user){
            return  res.status(400).json({
                message:"User already registered",
                status:401
            })
        }
        else if(!bcrypt.compareSync(req.body.password,user.password)){
            return res.status(400).send({
               message:"Incorrect password",
               status:400
            });    
        }
        else{
            const payload ={
                id:user._id,
                username:user.username
            }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
              expiresIn:"3d"
        });

        return res.status(200).send({
            status:200,
            message:"successfully logged in",
            token:"Bearer "+ token
        })
    }

    }
    catch(err){
       return  res.status(500).send({
            message:"Sorry! Server error",
            status:500
        })
    }
   
}
const users_dashboard_control = (req,res) =>{
   return res.status(200).send({
    success:true,
    user:{
        id:req.user._id,
        username:req.user.username
    }
   });

}



module.exports = {
    users_signup_control,
    users_login_control,
    users_dashboard_control
}