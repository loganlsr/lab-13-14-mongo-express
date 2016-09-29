'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');

const Schema = mongoose.Schema;

const Apple = require('./apple.js');

const listSchema = Schema({
  type: {type: String, required: true},
  color: {type: String, required: true},
  size: {type: String, required: true},
  timestamp: {type: Date, required: true},
  apples: [{type: Schema.Types.ObjectId, ref: 'apple'}]
});

const List = module.exports = mongoose.model('list', listSchema);

List.findByIdAndAddApple = function(id, apple){
  return List.findById(id)
  .catch(err => Promise.reject(createError(400, err.message)))
  .then(list => {
    apple.listID = list._id;
    this.tempList = list;
    return new Apple(apple).save();
  })
  .then( apple => {
    this.tempList.apples.push(apple._id);
    this.tempApple = apple;
    return this.tempList.save();
  })
  .then( () => {
    return this.tempApple;
  });
};
