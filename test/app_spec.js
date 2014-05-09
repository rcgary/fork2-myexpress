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

describe('Implement Error Handing',function(){
  var app;
  beforeEach(function() {
    app = new express();
  });
  it('should return 500 for unhandled error',function(done){
    var m1 = function(req,res,next){
      next(new Error('boom!'));
    }
    app.use(m1);
    request(app).get('/').expect(500).end(done);
  });

  it('should return 500 for unCaught error',function(done){
    var m1 = function(req,res,next){
      throw new Error('boom!');
    }
    app.use(m1);
    request(app).get('/').expect(500).end(done);
  });

  it('should skip error handlers when next is called without an error',function(done){
    var m1 = function(req,res,next){
      next();
    }
    var e1 = function(err,req,res,next){
    }
    var m2 = function(req,res,next){
      res.end("m2");
    }

    app.use(m1);
    app.use(e1);
    app.use(m2);
    request(app).get('/').expect('m2').end(done);
  });

  it('should skip normal middlewares if next is called with an error',function(done){
    var m1 = function(req,res,next){
      throw new Error('boom!');
    }
    var m2 = function(req,res,next){
    }
    var e1 = function(err,req,res,next){
      res.end('e1');
    }
    app.use(m1);
    app.use(m2);
    app.use(e1);
    request(app).get('/').expect('e1').end(done);
  });
});
describe('App embedding as middleware',function(){
  var app;
  var subApp;
  beforeEach(function() {
    app = new express();
    subApp = new express();
  });
  it('should pass unhandled request to parent',function(done){
    var m2 = function(req,res,next){
      res.end("m2");
    }
    app.use(subApp);
    app.use(m2);
    request(app).get('/').expect('m2').end(done);
  });
  it('should pass unhandled error to parent',function(done){
    var m1 = function(req,res,next){
      next("m1 error");
    }

    var e1 = function(err,req,res,next){
      res.end(err);
    }
    subApp.use(m1);
    app.use(subApp);
    app.use(e1);
    request(app).get('/').expect('m1 error').end(done);
  })
});
