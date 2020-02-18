'use strict';

var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

var cors = require('cors');

var app = express();

// Basic Configuration 
// var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;

// See https://medium.com/@vsvaibhav2016/best-practice-of-mongoose-connection-with-mongodb-c470608483f0
// successfully connected
db.on('connected', () => {
  console.log('Mongoose default connection is open.');
});

// on error
db.on('error', err => {
  console.log('Mongoose default connection has occured ' + err + ' error');
});

// disconnected
db.on('disconnected', () => {
  console.log('Mongoose default connection is dicsonnected');
});

// process end
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log("Mongoose default connection is disconnected due to application termination");
    process.exit(0);
  });
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(3000, function () {
  console.log('listening on 3000');
});