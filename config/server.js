const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;
const hostName = "127.0.0.1";
app.listen(port,hostName,(err)=>{
    if(err) console.log(`Sorry erro:${err}`);
    else console.log(`Your server is runing at:http://${hostName}:${port}`);
});



module.exports = app;