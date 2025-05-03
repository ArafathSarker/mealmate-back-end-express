const mongoose = require('mongoose');
const groupUsersSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name field is empty"]
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Group'
    },
    deposit:{
        type:Number,
        default:0
    },
    due:{
        type:Number,
        default:0
    },
    refund:{
        type:Number,
        default:0
    },
    CreatedOn:{
        type:Date,
        default:Date.now()
    }
});

module.exports = new mongoose.model('groupUsers',groupUsersSchema);