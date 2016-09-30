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
  timestamp: new Date(),
};

const exampleApple = {
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

    describe('with an invalid body', function(){

      it('should not return a 400', done => {
        request.post(`${url}/api/list/`)
        .send()
        .end((err, res) => {
          expect(res.status).to.equal(400);
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
          return List.findByIdAndAddApple(list._id, exampleApple);
        })
        .then( apple => {
          this.tempApple = apple;
          done();
        })
        .catch(done);
      });

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
        request.get(`${url}/api/list/${this.tempList._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.type).to.equal('rainbow');
          expect(res.body.color).to.equal('multi-colored');
          expect(res.body.size).to.equal('huge');
          expect(res.body.apples.length).to.equal(1);
          expect(res.body.apples[0].name).to.equal(exampleApple.name);
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

  describe('testing DELETE requests', function() {

    describe('with valid id', function() {

      before( done => {
        exampleList.timestamp = new Date();
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      it('should delete an item and give status code 204', done => {
        request.delete(`${url}/api/list/${this.tempList._id}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
        done();
      });
    });

    describe('for a file that does not exist', function() {

      it('should 404 not found', done => {
        request.delete(`${url}/api/list/no-apple`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('testing PUT requests', function() {

    describe('with valid id', function(){

      before( done => {
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempList){
          List.remove({})
          .then(() => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a list with a status 200', done => {
        let updateData = {type:'bad-apple', color: 'black', size: 'mini'};
        request.put(`${url}/api/list/${this.tempList._id}`)
        .send(updateData)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.type).to.equal(updateData.type);
          expect(res.body.color).to.equal(updateData.color);
          expect(res.body.size).to.equal(updateData.size);
          let timestamp = new Date(res.body.timestamp);
          expect(timestamp.toString()).to.equal(exampleList.timestamp.toString());
          this.tempList = res.body;
          done();
        });
      });
    });

    describe('with no body provided', function() {

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
        if(this.tempList) {
          List.remove({})
          .then(() => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a 400 bad request', done => {
        let updateData = 'good day';
        request.put(`${url}/api/list/${this.tempList._id}`)
        .set('Content-Type', 'application/json')
        .send(updateData)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with no body', function() {

      it('should 404 not found', done => {
        request.put(`${url}/api/list/no-list`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('testing GET requests with pagination', function(){
    describe('with valid body', function(){

      before( done => {
        var lists = [];
        for (var i = 0; i < 1000; i++){
          lists.push(new List(exampleList).save());
        }
        Promise.all(lists)
        .then( lists => {
          this.tempLists = lists;
          done();
        })
        .catch(done);
      });

      after( done => {
        if(this.tempLists){
          List.remove({})
          .then(() => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return 50 lists', done => {
        request.get(`${url}/api/list`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.length).to.equal(50);
          done();
        });
      });
    });
  });
});
