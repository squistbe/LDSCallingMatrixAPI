var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

var router = require('./app/routes');

// use native Promises
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

var port = process.env.PORT || 8080;
app.listen(port);
console.log("App listening on port " + port);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors());

router(app);
