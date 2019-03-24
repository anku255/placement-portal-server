const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/errorHandler');

const app = express();

// Use bodyParser to put raw req properties at req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cors setup
// cors setup
const corsOptions = {
  origin: ['http://localhost:3000', 'https://placement-portal.netlify.com'],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// use JWT auth to secure the api
app.use(jwt());

// handle routes
app.use('/', routes);

// global error handler
app.use(errorHandler);

module.exports = app;
