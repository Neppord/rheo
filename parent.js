module.exports = Parent

var Deque = require('double-ended-queue')

var MARKER = {}

function Parent () {
  this.children = new Deque()
}

Parent.prototype.add_child = function (child) {
  this.children.enqueue(child)
  child.parent = this
}

Parent.prototype.remove_child = function (child) {
  var children = this.children
  children.enqueue(MARKER)
  var obj = children.dequeue()
  while (obj !== MARKER) {
    if (obj !== children) children.enqueue(obj)
    obj = children.dequeue()
  }
  child.parent = null
}

Parent.prototype.move_children = function (parent) {
  var child = this.children.dequeue()
  while (child) {
    parent.add_child(child)
    child = this.children.dequeue()
  }
}
