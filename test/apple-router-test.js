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

  describe('testing GET requests', function(){
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
        request.get(`${url}/api/list/${this.tempList.id}/apple`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.type).to.equal(exampleApple.type);
          expect(res.body.color).to.equal(exampleApple.color);
          expect(res.body.size).to.equal(exampleApple.size);
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

      it('should return error code 404', done => {
        request.get(`${url}/api/list/${this.tempList.id}/no-apple`)
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
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      it('should delete an item and give status code 204', done => {
        request.delete(`${url}/api/list/${this.tempList.id}/apple`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
        done();
      });
    });

    describe('for a file that does not exist', function() {

      before( done => {
        new List(exampleList).save()
        .then( list => {
          this.tempList = list;
          done();
        })
        .catch(done);
      });

      it('should give error code 404 not found', done => {
        request.delete(`${url}/api/list/${this.tempList.id}/no-apple`)
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
        request.put(`${url}/api/list/${this.tempList.id}/apple`)
        .send(updateData)
        .end((err, res) => {
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
        request.put(`${url}/api/list/${this.tempList.id}/apple`)
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
        request.put(`${url}/api/list/${this.tempList.id}/no-apple`)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
