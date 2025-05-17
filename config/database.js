const mongoose = require('mongoose');
const dev = require('./config');
mongoose.connect(dev.db.url)
.then(()=>{
    console.log("Database connected sucessfully");
})
.catch(()=>{
    console.log(new Error("Database not connected"));
});


module.exports = mongoose;