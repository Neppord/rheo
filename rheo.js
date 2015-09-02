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

Rheo.prototype.outer = function (selector, obj) {
  var Outer = require('./outer')
  var rheo = require('./')
  if (typeof obj === 'function') {
    return this.pipe(new Outer(selector, obj))
  } else if (typeof obj.pipe === 'function') {
    return this.pipe(new Outer(selector, value(obj)))
  } else {
    return this.pipe(new Outer(selector, value(
      rheo(obj)
    )))
  }
}

Rheo.prototype.find = function (selector) {
  var Find = require('./find')
  return this.pipe(new Find(selector))
}

Rheo.prototype.inner = function (selector, obj) {
  var Inner = require('./inner')
  var rheo = require('./')
  if (typeof obj === 'function') {
    return this.pipe(new Inner(selector, obj))
  } else if (typeof obj.pipe === 'function') {
    return this.pipe(new Inner(selector, value(obj)))
  } else {
    return this.pipe(new Inner(selector, value(
      rheo(obj)
    )))
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

Rheo.prototype.every_attribute = function (sel, attr, obj) {
  var EveryAttribute = require('./every_attribute')
  if (typeof obj === 'function') return this.pipe(new EveryAttribute(sel, attr, obj))
  else return this.pipe(new EveryAttribute(sel, attr, value(obj)))
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
