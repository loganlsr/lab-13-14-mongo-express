'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();

const List = require('../model/list.js');

const appleRouter = module.exports = new Router;

appleRouter.post('/api/list/:listID/apple', jsonParser, function(req, res, next){
  List.findByIdAndAddApple(req.params.listID, req.body)
  .then(apple => res.json(apple))
  .catch(next);
});
