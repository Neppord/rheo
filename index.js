// Need to export before we include if they include us
module.exports = rheo
rheo.chain = chain
rheo.from_tokens = chain
rheo.pipeline = chain
rheo.mixin = mixin

var h = require('highland')
var find_stream = require('./find')
var replace_stream = require('./replace')
var parse_stream = require('./parse')
var render_stream = require('./render')
var map_stream = require('./map')

function mixin (self) {
  self.find = function find (selector) {
    return mixin(self.pipe(find_stream(selector)))
  }
  self.render = function render () {
    return mixin(self.pipe(render_stream()))
  }
  self.replace = function replace (selector, arg) {
    return mixin(self.pipe(replace_stream.outer(selector, function (stream) {
      if (h.isFunction(arg)) {
        return arg(mixin(stream))
      } else {
        return arg
      }
    })))
  }
  self.replace.inner = function replace_inner (selector, arg) {
    return mixin(self.pipe(replace_stream.inner(selector, function (stream) {
      if (h.isFunction(arg)) {
        return arg(mixin(stream))
      } else {
        return arg
      }
    })))
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
