const GroupUsers = require('../model/users.groupusersSchema'); 
const Group = require('../model/users.groupSchema'); 
const mongoose = require('mongoose');
async function updateDeposit(userId, groupId, depositAmount) {
    try {
       
        const updatedUser = await GroupUsers.findByIdAndUpdate(
            userId,
            { $inc: { deposit: depositAmount } }, 
            { new: true } 
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

       
        const totals = await GroupUsers.aggregate([
            { $match: { group:new mongoose.Types.ObjectId(groupId) } }, 
            {
                $group: {
                    _id: null, 
                    totalDeposit: { $sum: "$deposit" } 
                }
            }
        ]);

        const { totalDeposit = 0 } = totals[0] || {};

       
        await Group.findByIdAndUpdate(
            groupId,
            { totalDeposit },
            { new: true }
        );

       
        return { message: "Deposit updated successfully", totalDeposit };
    } catch (err) {
        console.error("Error updating deposit:", err.message);
        throw err;
    }
}

module.exports = updateDeposit;