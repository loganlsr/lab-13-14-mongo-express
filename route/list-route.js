'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const List = require('../model/list.js');
const pageMiddleware = require('../lib/page-middleware.js');

const listRouter = module.exports = new Router();

listRouter.post('/api/list', jsonParser, function(req, res, next){
  req.body.timestamp = new Date();
  new List(req.body).save()
  .then(list => res.json(list))
  .catch(next);
});

listRouter.get('/api/list/:id', function(req, res, next){
  List.findById(req.params.id)
  .populate('apples')
  .then(list => res.json(list))
  .catch(err => next(createError(404, err.message)));
});

listRouter.delete('/api/list/:id', function(req, res, next){
  List.findByIdAndRemove(req.params.id)
  .then(() => res.status(204))
  .catch(err => next(createError(404, err.message)));
});

listRouter.put('/api/list/:id', jsonParser, function(req, res, next){
  List.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then(list => res.json(list))
  .catch(err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});

listRouter.get('/api/list', pageMiddleware, function(req, res, next){
  let offset = req.query.offset;
  let pagesize = req.query.pagesize;
  let page = req.query.page;
  let skip = offset + pagesize * (page);
  List.find().skip(skip).limit(pagesize)
  .then( lists => res.json(lists))
  .catch(next);
});
