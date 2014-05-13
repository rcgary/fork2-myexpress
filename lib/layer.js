var p2re = require('path-to-regexp');
module.exports = Layer = function(root,middleware){
  root = root.charAt(root.length - 1) == "/" ? root.substr(0, root.length - 1) : root;
  this.handle = middleware;
  this.root = root;
}

Layer.prototype.match = function(root){
  var names = [];
  var re = p2re(this.root,names,{end: false})
  paths = re.exec(decodeURIComponent(root));
  if (paths) {
    return {path : paths[0] , params:{ a: paths[1], b: paths[2], } }
  }
  else {

  }
}
