var http = require('http');
var methods = require('methods');
var Layer = require("./lib/layer");
var makeRoute = require("./lib/route");

module.exports = function(){
  function express(req,res,next){
    express.handle(req, res, next);
  }

  express.listen = function(port,done){
    return  http.createServer(this).listen(port,done);
  }

  express.stack = [];

  express.use = function(path,middleware,prefix){
    if (typeof path != 'string') {
      middleware = path;
      path = '/';
    }
    prefix = prefix || false;
    var layer = new Layer(path,middleware,prefix);
    this.stack.push(layer);
  }

  express.handle = function(req,res,out){
    var index = 0;
    var stack = this.stack;
    function next(error){
      var layer = stack[index++];
      if(!layer)
        {
          if (out) return out(error);
          if (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            res.end('500 - Internal Error');
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end("404 - Not Found");
          }
          return;
        }
        try {
          req.params = {};
          var matchResult = layer.match(req.url);
          if (!matchResult) return next(error);
          req.params = matchResult.params;
          var arity = layer.handle.length;
          if (error) {
            if (arity == 4) {
              layer.handle(error, req, res, next);
            } else {
              next(error);
            }
          } else if (arity < 4) {
            layer.handle(req, res, next);
          } else {
            next();
          }
        } catch (e) {
          next(e);
        }
    }
    next();
  }

  methods.forEach(function(method){
    express[method] = function(path,middleware){
      middleware = makeRoute(method,middleware);
      express.use(path,middleware,true);
    }
  });
  return express;
}
