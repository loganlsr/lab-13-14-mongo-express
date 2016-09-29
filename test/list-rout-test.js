'use strict';

const PORT = process.env.PORT || 3000;
process.env.MONGODB_URI = 'mongodb://localhost/appletest';

const expect = require('chai').expect;
const request = require('superagent');
const List = require('../model/list.js');
require('../server.js');

const url = `http://localhost:${PORT}`;
const exampleList = {
  type: 'rainbow',
  color: 'multi-colored',
  size: 'huge',
};

describe('testing route /api/list', function(){

  describe('testing POST requests', function(){
    describe('with valid body', function(){

      after( done => {
        if(this.tempList){
          List.remove({})
          .then(() => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a list', done => {
        request.post(`${url}/api/list`)
        .send(exampleList)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.type).to.equal('rainbow');
          expect(res.body.color).to.equal('multi-colored');
          expect(res.body.size).to.equal('huge');
          this.tempList = res.body;
          done();
        });
      });
    });
  });

  describe('testing GET requests', function(){
    describe('with valid body', function(){

      before( done => {
        exampleList.timestamp = new Date();
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      after( done => {
        delete exampleList.timestamp;
        if(this.tempList){
          List.remove({})
          .then(() => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a list', done => {
        request.get(`${url}/api/list/${this.tempList._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.type).to.equal('rainbow');
          expect(res.body.color).to.equal('multi-colored');
          expect(res.body.size).to.equal('huge');
          done();
        });
      });
    });

    describe('for a file that does not exist', function() {

      it('should give error code 404 if no id', done => {
        request.get(`${url}/api/apple/no-apple`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('Testing DELETE /api/apple:id requests', function() {

    describe('with valid id', function() {

      before( done => {
        exampleList.timestamp = new Date();
        new List(exampleList).save()
        .then( apple => {
          this.tempApple = apple;
          done();
        })
        .catch(done);
      });

      it('should delete an apple and give status code 204', done => {
        request.delete(`${url}/api/apple/${this.tempApple._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });

    describe('for a file that does not exist', function() {

      it('should 404 not found', done => {
        request.delete(`${url}/api/apple/no-apple`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

});
