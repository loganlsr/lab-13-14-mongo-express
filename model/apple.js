'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appleSchema = Schema({
  type: {type: String, required: true},
  color: {type: String, required: true},
  size: {type: String, requried: true},
  listID: {type: Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('apple', appleSchema);
