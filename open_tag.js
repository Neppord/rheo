module.exports = OpenTag

var util = require('util')

var Parent = require('./parent')

util.inherits(OpenTag, Parent)

function OpenTag (name, attrs, parent) {
  Parent.call(this)
  this.type = 'open'
  this.name = name
  this.attrs = attrs
  this.parent = parent
}

OpenTag.prototype.is_document = function () {
  return false
}

OpenTag.prototype.is_tag = function () {
  return true
}
