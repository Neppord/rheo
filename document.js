module.exports = Document

var util = require('util')

var Parent = require('./parent')

util.inherits(Document, Parent)

function Document () {
  Parent.call(this)
  this.type = 'document'
}

Document.prototype.is_document = function () {
  return true
}

Document.prototype.is_tag = function () {
  return false
}
