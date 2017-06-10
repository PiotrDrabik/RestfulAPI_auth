const express = require("express");
const bodyParser = require('body-parser');
const app = express();
var port = process.env.PORT || 8080;
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );

const userapi = require('./api/userapi.js');
const mongoose = require('mongoose');

var passport = require("passport");

mongoose.connect("#");
mongoose.Promise = global.Promise;

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.removeHeader("X-Powered-By");
    next();
})

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Accept,Authorization');
    next();
});

app.use('/authuser',userapi);

app.listen(port, function() {
    console.log(`It's a kind of magic at ${port}`);
})