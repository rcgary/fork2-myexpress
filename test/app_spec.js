var express = require("../");
var request = require("supertest");
var http = require("http");
var expect = require("chai").expect;

describe("app",function() {
  var app = express();
  describe("create http server",function() {
    it("should responds to /foo with 404",function(done){
      request(app)
      .get("/foo")
      .expect(404)
      .end(done);
    });
  });

  describe("#listen",function() {
    var server;
    var port = 7000;
    before(function(done){
      server = app.listen(port,done)
    });

    it("should return an http.Server",function(){
      expect(server).to.be.instanceof(http.Server);
    });

    it("should response to /foo with 404",function(done){
      request('http://localhost:'+port)
      .get("/foo")
      .expect(404)
      .end(done);
    });
  });
});

describe(".use",function() {
  var app;
  var m1 = function(){};
  var m2 = function(){};
  before(function(){
    app = express();
  });
  it('should able to add stacks',function(){
    app.use(m1);
    app.use(m2);
    expect(app.stack.length).to.eql(2);
  });
});

describe("calling middleware stack",function() {
  var app;
  beforeEach(function() {
    app = new express();
  });
  it('should be able to call a single middleware',function(done){
    var m1 = function(req,res,next) {
      res.end("hello from m1");
    };
    app.use(m1);
    request(app).get('/').expect('hello from m1').end(done)
  });

  it('Should be able to call next to go to the next middleware',function(done){
    var m1 = function(req,res,next) {
      next();
    };

    var m2 = function(req,res,next) {
      res.end("hello from m2");
    };
    app.use(m1);
    app.use(m2);
    request(app).get('/').expect('hello from m2').end(done);
  });

  it('Should 404 at the end of middleware chain',function(done){
    var m1 = function(req,res,next) {
      next();
    };

    var m2 = function(req,res,next) {
      next();
    };
    app.use(m1);
    app.use(m2);
    request(app).get('/').expect(404).end(done);
  });
});
