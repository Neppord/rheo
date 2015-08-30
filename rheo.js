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
    return this.pipe(new Replace(selector, value(obj)))
  }
}
Rheo.prototype.outer = Rheo.prototype.replace

Rheo.prototype.find = function (selector) {
  var Find = require('./find')
  return this.pipe(new Find(selector))
}

Rheo.prototype.inner = function (selector, obj) {
  var Inner = require('./inner')
  if (typeof obj === 'function') {
    return this.pipe(new Inner(selector, obj))
  } else if (typeof obj.pipe === 'function') {
    return this.pipe(new Inner(selector, value(obj)))
  }
}

Rheo.prototype.map = function (callback) {
  var _Map = require('./map')
  return new _Map(this, callback)
}

Rheo.prototype.attribute = function (sel, attr, obj) {
  var Attribute = require('./attribute')
  if (typeof obj === 'function') return this.pipe(new Attribute(sel, attr, obj))
  else return this.pipe(new Attribute(sel, attr, value(obj)))
}

Rheo.prototype.attributes = function (sel, attrs) {
  var Attributes = require('./attributes')
  var hash = {}
  for (var key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      if (typeof attrs[key] === 'function') hash[key] = attrs[key]
      else hash[key] = value(attrs[key])
    }
  }
  return this.pipe(new Attributes(sel, hash))
}

function value (obj) {
  return function () {
    return obj
  }
}
