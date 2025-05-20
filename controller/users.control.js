const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config();
//mongoose schema model
const User = require('../model/users.signupSchema');
const groupUsersSchema = require('../model/users.groupusersSchema');
const groupSchema = require('../model/users.groupSchema');
const groupListSchema = require('../model/users.grouplist');
//custrom functions 
const updateDeposit = require('../customfunction/updateDepositFunction');
const updateMeals = require('../customfunction/updateMealsFunction');
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
        else if(req.body.password.length < 6){
            return res.status(400).send({
                message:"Password must be at least 6 characters",
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
                message:"User not registered",
                status:400
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
        
     try{
        const Group = await groupSchema.findOne({
            groupname:req.body.groupname
        });
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
                message:"User not registered in this website",
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
           message:`Sorry server error`,
              success:false
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
//fetching the group data
const fetch_group_data_control = async (req,res)=>{
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
        return res.status(200).send({
            message:"Data fetched successfully",
            success:true,
            ...group._doc
           
        });
      }
      catch(err)
      {
        res.status(500).json({
            message:"Sorry! server error",
            sucess:false
        });
      }
}
//fetching the group user data
const fetch_group_user_data_control = async (req,res)=>{
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
  return res.status(200).send({
    message:"Data fetched successfully",
    success:true,
    ...groupUser._doc
   
});
}
 catch(err)
{
  res.status(500).json({
      message:"Sorry! server error",
      sucess:false
  });
}
}
//Updating the deposit amount
const update_deposit_control = async (req, res) => {
    const { userId, groupId, depositAmount } = req.body;

    try {
        const result = await updateDeposit(userId, groupId, depositAmount);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Sorry! server error" });
    }
}
//Updating the meal count
const update_meal_control =  async (req, res) => {
    const { userId, groupId, mealCount } = req.body;

    try {
        const result = await updateMeals(userId, groupId, mealCount);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message:"Sorry! server error" });
    }
}
//Adding the cost in the group
const add_cost_control = async (req, res) => {
    const { groupId, cost } = req.body;

    try {
        const group = await groupSchema.findByIdAndUpdate(
                    groupId,
                    { $inc: { totalCost:cost } }, 
                    { new: true } 
                );
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Cost added successfully', group });
    } catch (err) {
        res.status(500).json({ message:"Sorry! server error" });
    }
}
//Clearing the dues
const clear_due_control = async (req, res) => {
    const { name, username } = req.body;

    if (!name || !username) {
        return res.status(400).json({
            message: "'username' required",
            success: false,
        });
    }

    try {
        const author = await groupUsersSchema.findOne({ name });
        const grpmem = await groupUsersSchema.findOne({ name:username });
        if (!author || !grpmem) {
            return res.status(400).json({
                message: "Sorry, user is not in the database",
                success: false,
            });
        }

        if (!author.refund || author.refund <= 0) {
            return res.status(400).json({
                message: "You have no pending amount",
                success: false,
            });
        }

        if (!grpmem.due || grpmem.due <= 0) {
            return res.status(400).json({
                message: "The user has no due",
                success: false,
            });
        }

        const amountToClear = Math.min(author.refund, grpmem.due);

        await groupUsersSchema.updateOne(
            { name:username },
            { $inc: { due: -amountToClear } },
            { new: true }
        );

        await groupUsersSchema.updateOne(
            { name },
            { $inc: { refund: -amountToClear } },
            { new: true }
        );

        return res.status(200).send({
            message: "Transaction successful",
            success: true,
        });
    } catch (err) {
        console.error("Error in clear_due_control:", err);
        res.status(500).json({ message: "Server error", success: false });
    }
};

//Adding the list items in the group
const add_list_items_control = async (req, res) => {
  const {group,name,item1,item2,item3,item4,item5,item6,item7
    ,item8,item9,item10} = req.body;
    try {
        const groupData = await groupSchema.findOne({ _id: group });
        if (!groupData) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const data = await groupListSchema.create({
            group,name,item1,item2,item3,item4,item5,item6,item7,item8,item9,item10
        });
        
        await groupSchema.findByIdAndUpdate(
                    group,
                    { $inc: { totalCost: data.totalPrice} }, 
                    { new: true } 
                );
        return  res.status(200).json({ message: 'List items added successfully' });
    } 
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}
//fetching the list items
const fetch_group_lists_control = async (req, res) => {
    const { groupId } = req.body;

    try {
        const groupLists = await groupListSchema.find({ group: groupId }).sort({ CreatedOn: -1 });
        if (!groupLists || groupLists.length === 0) {
            return res.status(404).json({ message: 'No lists found for this group', success: false });
        }

        return res.status(200).json({ message: 'Group lists fetched successfully', success: true, data:groupLists });
    } catch (err) {
        console.error("Error in fetch_group_lists_control:", err);
        res.status(500).json({ message: 'Server error', success: false });
    }
};
//Calculating the group logic
const calculate_group_control = async (req, res) => {
    const { name } = req.body;

    try {
        const groupUser = await groupUsersSchema.findOne({ name });
        if (!groupUser) {
            return res.status(404).json({ message: 'User not found in the database' });
        }
        const groupId = groupUser.group;
        const group = await groupSchema.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        //The calculation logic
       for (const memberId of group.members) {
    const groupUser = await groupUsersSchema.findById(memberId);
    let mealRate = group.totalCost / group.totalMeal;
        let totalConsumed = groupUser.numberofMeal * mealRate;
        let due=0,refund=0;
        if (totalConsumed > groupUser.deposit) {
            due = totalConsumed - groupUser.deposit;
            refund = 0;
        } else if (totalConsumed < groupUser.deposit) {
            refund = groupUser.deposit - totalConsumed;
            due = 0;
        } else {
            refund = 0;
            due = 0;
        }
        await groupUsersSchema.findByIdAndUpdate(memberId, {
            $set: {
            
                totalConsumed,
                numberofMeal:0,
                deposit:0,
            },
             $inc: { 
                due,
                refund,

            },
                   
        }, { new: true });
        await groupSchema.findByIdAndUpdate(groupId, {
            $set: {
            
                totalCost:0,
                totalDeposit:0,
                totalMeal:0,
                mealRate,
            }
                   
        });
       
}
       
        return res.status(200).json({ message: 'Calculation successfull', success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}
module.exports = {
    users_signup_control,
    users_login_control,
    users_dashboard_control,
    users_group_control,
    addUser_group_control,
    check_user_control,
    fetch_group_data_control,
    fetch_group_user_data_control,
    update_deposit_control,
    update_meal_control,
    add_cost_control,
    clear_due_control,
    add_list_items_control,
    fetch_group_lists_control,
    calculate_group_control,
}