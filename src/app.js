const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/errorHandler');

const app = express();

// Use bodyParser to put raw req properties at req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use JWT auth to secure the api
app.use(jwt());

// handle routes
app.use('/', routes);

// global error handler
app.use(errorHandler);

module.exports = app;
