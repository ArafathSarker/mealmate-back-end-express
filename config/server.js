const express = require('express');
const app = express();
require('dotenv').config();
const dev = require('./config');
const port = dev.app.port;
const hostName = "0.0.0.0";
app.listen(port,hostName,(err)=>{
    if(err) console.log(`Sorry erro:${err}`);
    else console.log(`Your server is runing at:http://${hostName}:${port}`);
});



module.exports = app;