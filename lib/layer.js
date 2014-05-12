module.exports = Layer = function(root,middleware){
  this.handle = middleware;
  this.root = root;
}

Layer.prototype.match = function(root){
  if (root.match(this.root)) {
    return{path : this.root};
  }
}
