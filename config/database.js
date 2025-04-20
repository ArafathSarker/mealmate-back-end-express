const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DB_URL)
.then(()=>{
    console.log("Database connected sucessfully");
})
.catch(()=>{
    console.log(new Error("Database not connected"));
});


module.exports = mongoose;