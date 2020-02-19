'use strict';

var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const shortid = require('shortid');
require('dotenv').config();

var cors = require('cors');

var app = express();

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

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

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl/new', (req, res) => {
  let original_url = req.body.url;
  if (!validUrl.isUri(original_url)) {
    res.send({"error":"invalid URL"});
  } else {
    let short_url = shortid.generate();
    let urls = new Url({original_url, short_url});
    urls.save(err => {
      if (err) return console.log(err);
      res.send({original_url, short_url});
    });
  }
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  let short_url = req.params.shorturl;
  db.collection('urls').findOne({short_url}, (err, data) => {
    if (err) return console.log(err);
    res.redirect(data.original_url);
  });
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(3000, function () {
  console.log('listening on 3000');
});