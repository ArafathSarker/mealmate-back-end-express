const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
       groupname:{
        type:String,
        required:[true,"Group name field is empty"]
       },
       members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'groupUsers'
    }],
    totalCost: {
        type: Number,
        default: 0
      },
      totalDeposit: {
        type: Number,
        default: 0
      },
      CreatedOn:{
        type:Date,
        default:Date.now()
    }
});

module.exports = new mongoose.model('Group',groupSchema);