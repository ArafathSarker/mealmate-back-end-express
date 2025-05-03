const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config();
//mongoose schema model
const User = require('../model/users.signupSchema');
const groupUsersSchema = require('../model/users.groupusersSchema');
const groupSchema = require('../model/users.groupSchema');
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
            username:user.username,
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
//Dashboard group controller 
const users_group_control = async (req,res)=>{
        const Group = await groupSchema.findOne({
            groupname:req.body.groupname
        });
     try{
            if(Group)
            {
                return res.status(400).json({
                    message:"Group already exists",
                    success:false
                });
            }else{
           const group =  await groupSchema.create({
            groupname:req.body.groupname
            });
            const groupUser = await groupUsersSchema.create({
                name:req.params.username,
                group:group._id
            });
            await groupSchema.updateOne({
                groupname:req.body.groupname
            },{
                $push:{members:groupUser._id}
            });
         return res.status(201).send({
            message:"Group created successfully",
            success:true,
         });
        }
     }catch(err)
     {
        res.status(500).send({
            message:"Sorry! server error",
        })
     }
};
//Adding users with id in the group
const addUser_group_control = async (req,res)=>{
    const groupUsers = await Promise.all(
        req.body.userList.map(async (member) => {
            return groupUsersSchema.findOne({ name: member });
        })
    );
    const check = await Promise.all(
        req.body.userList.map(async (member) => {
            return User.findOne({ username: member });
        })
    );

    const existingUsers = groupUsers.filter((user) => user !== null);
    const isRegistered = check.filter((user) => user == null);
   
    try{
        if(existingUsers.length > 0)
        {
            res.status(400).json({
                message:"User already exist in this group",
                success:false
            });
        }
        else if(isRegistered.includes(null))
        {
            res.status(400).send({
                message:"User is not registered in out website",
                success:false
            });
        }
        else{
            const group = await groupSchema.findOne({
                groupname:req.body.groupname
            });
            const groupUsersData = req.body.userList.map((userId) => ({
                name: userId,
                group:group._id, 
            }));
            const groupUserId = await groupUsersSchema.insertMany(groupUsersData);
            const userIds = groupUserId.map((user) => user._id);
            await groupSchema.updateOne({
            groupname:req.body.groupname
            },{
                $push:{ members:{$each: userIds} }
            });
           
            return res.status(201).json({
                message:"Group user added successfully",
                success:true
            });
        }
    }
    catch(err)
    {
        res.status(500).json({
           message:`Sorry server error:${err} `
        });
    }
};
const check_user_control = async (req,res)=>{
   
    try{
        const groupUser = await groupUsersSchema.findOne({
            name:req.body.name
      });
      if(!groupUser){
        return res.status(400).json({
            message:"Sorry User is not in the database",
            success:false
        });
      }
      const group = await groupSchema.findOne({
          _id:groupUser.group
      });
       if(!group)
       {
        return res.status(400).send({
            message:"Sorry! User found in the group database",
            success:false
        });
       }
       else{
        return res.status(200).json({
            message:"User found in the database",
            success:true
        });
    }
       
    }catch(err)
    {
        res.status(500).json({
            message:"Sorry! server error",
            sucess:false
        });
    }
}
module.exports = {
    users_signup_control,
    users_login_control,
    users_dashboard_control,
    users_group_control,
    addUser_group_control,
    check_user_control,
}