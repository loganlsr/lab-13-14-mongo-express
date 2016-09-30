'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const List = require('../model/list.js');

const appleRouter = module.exports = new Router;

appleRouter.post('/api/list/:listID/apple', jsonParser, function(req, res, next){
  List.findByIdAndAddApple(req.params.listID, req.body)
  .then(apple => res.json(apple))
  .catch(next);
});

appleRouter.get('/api/list/:listID/apple', function(req, res, next){
  List.findById(req.params.listID)
  .then(apple => res.json(apple))
  .catch(next);
});

appleRouter.delete('/api/list/:listID/apple', function(req, res, next){
  List.findByIdAndRemove(req.params.id)
  .then(() => res.status(204))
  .catch(err => next(createError(404, err.message)));
});

appleRouter.put('/api/list/:listID/apple', jsonParser, function(req, res, next){
  List.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then(list => res.json(list))
  .catch(err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});
