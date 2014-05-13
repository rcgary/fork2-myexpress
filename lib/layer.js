var p2re = require('path-to-regexp');
module.exports = Layer = function(root,middleware){
  root = root.charAt(root.length - 1) == "/" ?
    root.substr(0, root.length - 1) : root;
  this.handle = middleware;
  this.root = root;
}

Layer.prototype.match = function(root){
  var names = [];
  var params = {};
  var re = p2re(this.root,names,{end: false})
  var paths = re.exec(decodeURIComponent(root));
  if (paths) {
    names.forEach(function(key,index){params[key.name]=paths[index+1]})
    return {path : paths[0] , params:params }
  }
}
