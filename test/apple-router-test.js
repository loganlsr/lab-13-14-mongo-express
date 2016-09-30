'use strict';

const PORT = process.env.PORT || 3000;
process.env.MONGODB_URI = 'mongodb://localhost/appletest';

const expect = require('chai').expect;
const request = require('superagent');
const List = require('../model/list.js');
const Apple = require('../model/apple.js');
require('../server.js');

const url = `http://localhost:${PORT}`;
const exampleApple = {
  type: 'rainbow',
  color: 'multi-colored',
  size: 'huge',
};

const exampleList = {
  type: 'rainbow',
  color: 'multi-colored',
  size: 'huge',
  timestamp: new Date(),
};

describe('testing apple routes', function(){
  describe('testing POST requests', function(){
    describe('with valid list id and appleBody', function(){

      before(done => {
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      after(done => {
        Promise.all([
          List.remove({}),
          Apple.remove({}),
        ])
        .then(() => done())
        .catch(done);
      });

      it('should return an apple', done => {
        request.post(`${url}/api/list/${this.tempList.id}/apple`)
        .send(exampleApple)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.type).to.equal(exampleApple.type);
          expect(res.body.listID).to.equal(this.tempList._id.toString());
          done();
        });
      });
    });

    describe('with an invalid list id and appleBody', function(){

      before(done => {
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      after(done => {
        Promise.all([
          List.remove({}),
          Apple.remove({}),
        ])
        .then(() => done())
        .catch(done);
      });

      it('should return error code 400', done => {
        request.post(`${url}/api/list/${this.tempList.id}/apple`)
        .send()
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
});
