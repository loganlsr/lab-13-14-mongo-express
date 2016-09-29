'use strict';

// npm modules
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const debug = require('debug')('apple:server');
const mongoose = require('mongoose');
const Promise = require('bluebird');

// app modules
const listRouter = require('./route/list-route.js');
const appleRouter = require('./route/apple-route.js');
const errorMiddleware = require('./lib/error-middleware.js');

// module constants
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/appledev';

// connect to database
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

const app = express();
app.use(cors());
app.use(morgan('dev'));


app.use(listRouter);
app.use(appleRouter);
app.use(errorMiddleware);

const server = module.exports = app.listen(PORT, function(){
  debug(`server up ${PORT}`);
});

server.isRunning = true;
