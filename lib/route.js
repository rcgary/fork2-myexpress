module.exports = makeRoute = function(verb, handler){
  return function(req,res,next){
    if (verb == req.method.toLowerCase()) {
      handler(req,res,next);
    }
    else {
      next()
    }
  }
}


