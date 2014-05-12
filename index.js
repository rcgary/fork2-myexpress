var http = require('http');
var Layer = require("./lib/layer");

module.exports = function(){
  function express(req,res,next){
    express.handle(req, res, next);
  }

  express.listen = function(port,done){
    return  http.createServer(this).listen(port,done);
  }

  express.stack = [];

  express.use = function(path,middleware){
    if (typeof path != 'string') {
      middleware = path;
      path = '/';
    }
    var layer = new Layer(path,middleware);
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
          if (! layer.match(req.url)) return next(error);
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
  return express;
}
