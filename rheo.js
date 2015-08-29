module.exports = Rheo
var util = require('util')
var Transform = require('stream').Transform

util.inherits(Rheo, Transform)

function Rheo (opts) {
  Transform.call(this, opts)
}

Rheo.prototype._transform = function (obj, enc, cb) {
  this.push(obj)
  cb()
}

Rheo.prototype.render = function () {
  var Render = require('./render')
  return this.pipe(new Render())
}

Rheo.prototype.replace = function (selector, obj) {
  var Replace = require('./replace')
  if (typeof obj === 'function') {
    return this.pipe(new Replace(selector, obj))
  } else if (typeof obj.pipe === 'function') {
    return this.pipe(new Replace(selector, stream_wraper(obj)))
  }
}

Rheo.prototype.find = function (selector) {
  var Find = require('./find')
  return this.pipe(new Find(selector))
}

function stream_wraper (stream) {
  return function () {
    return stream
  }
}
