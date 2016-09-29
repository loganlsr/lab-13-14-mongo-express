'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const listSchema = Schema({
  type: {type: String, required: true},
  color: {type: String, required: true},
  size: {type: String, required: true},
  timestamp: {type: Date, required: true},
});

module.exports = mongoose.model('list', listSchema);
