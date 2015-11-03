module.exports = OpenComment

var util = require('util')

var Parent = require('./parent')

util.inherits(OpenComment, Parent)

function OpenComment (text, parent) {
  Parent.call(this)
  this.type = 'open_comment'
  this.value = text
  this.parent = parent
}

OpenComment.prototype.is_document = function () {
  return false
}

OpenComment.prototype.is_tag = function () {
  return false
}

