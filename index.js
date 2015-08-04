// Need to export before we include if they include us
module.exports = rheo
rheo.chain = chain
rheo.from_tokens = chain
rheo.pipeline = chain
rheo.mixin = mixin

var h = require('highland')
var find_stream = require('./find')
var set_stream = require('./set')
var replace_stream = require('./replace')
var parse_stream = require('./parse')
var render_stream = require('./render')
var map_stream = require('./map')
var verify_stream = require('./verify')

function mixin (self) {
  self.verify = function verify () {
    return mixin(self.pipe(verify_stream()))
  }
  self.find = function find (selector) {
    return mixin(self.pipe(find_stream(selector)))
  }
  self.render = function render () {
    return mixin(self.pipe(render_stream()))
  }
  self.set = function set (selector, stream) {
    return mixin(self.pipe(set_stream.outer(selector, stream)))
  }
  self.set.inner = function set_inner (selector, stream) {
    return mixin(self.pipe(set_stream.inner(selector, stream)))
  }
  self.replace = function replace (selector, arg) {
    if (h.isFunction(arg)) {
      var s = replace_stream.outer(selector, wrap_callback(arg))
      return mixin(self.pipe(s))
    } else {
      return self.set(selector, arg)
    }
  }
  self.replace.inner = function replace_inner (selector, arg) {
    if (h.isFunction(arg)) {
      var s = replace_stream.inner(selector, wrap_callback(arg))
      return mixin(self.pipe(s))
    } else {
      return self.set.inner(selector, arg)
    }
  }
  self.replace.attribute = function replace_attribute (selector, attr, cb) {
    var replace_attr = replace_stream.attribute(selector, attr, cb)
    return mixin(self.pipe(replace_attr))
  }
  self.replace.attributes = function replace_attributes (selector, obj) {
    var replace_attrs = replace_stream.attributes(selector, obj)
    return mixin(self.pipe(replace_attrs))
  }
  self.map = function map (callback) {
    return mixin(map_stream(self, function (stream, data) {
      return callback(mixin(stream), data)
    }))
  }
  return self
}

function rheo (text) {
  var rheo = mixin(parse_stream())
  if (h.isString(text)) rheo.end(text)
  else if (text) {
    if (h.isFunction(text.pipe)) text.pipe(rheo)
    else if (h.isFunction(text.toString)) rheo.end(text.toString())
  }
  return rheo
}

function chain (func) {
  if (h.isFunction(func)) {
    return mixin(h.pipeline(function (stream) {
      return func(mixin(stream)).pipe(h())
    }))
  } else {
    return mixin(h())
  }
}

function wrap_callback (callback) {
  return function (stream) {
    return callback(mixin(stream))
  }
}
