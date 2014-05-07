var http = require('http');

module.exports = function(){
  var express =  function (request,response){
    response.statusCode = 404;
    response.end();
  }

  express.listen = function(port,done){
    return  http.createServer(this).listen(port,done);
  }

  return express;
}
