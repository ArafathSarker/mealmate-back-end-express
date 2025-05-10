const GroupUsers = require('../model/users.groupusersSchema'); 
const Group = require('../model/users.groupSchema');
const mongoose = require('mongoose');
async function updateMeals(userId, groupId, mealCount) {
    try {
       
        const updatedUser = await GroupUsers.findByIdAndUpdate(
            userId,
            { $inc: { numberofMeal: mealCount } }, 
            { new: true } 
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        
        const totals = await GroupUsers.aggregate([
            { $match: { group:new mongoose.Types.ObjectId(groupId )} }, 
            {
                $group: {
                    _id: null, 
                    totalMeal: { $sum: "$numberofMeal" } 
                }
            }
        ]);

        const { totalMeal = 0 } = totals[0] || {};

       
        await Group.findByIdAndUpdate(
            groupId,
            { totalMeal },
            { new: true }
        );

        
        return { message: "Meals updated successfully", totalMeal };
    } catch (err) {
        console.error("Error updating meals:", err.message);
        throw err;
    }
}


module.exports = updateMeals;