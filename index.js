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
    return mixin(self.through(verify_stream()))
  }
  self.find = function find (selector) {
    return mixin(self.through(find_stream(selector)))
  }
  self.render = function render () {
    return mixin(self.through(render_stream()))
  }
  self.set = function set (selector, stream) {
    return mixin(self.through(set_stream.outer(selector, stream)))
  }
  self.set.inner = function set_inner (selector, stream) {
    return mixin(self.through(set_stream.inner(selector, stream)))
  }
  self.set.attribute = function set_attribute (selector, text) {
    return mixin(self.through(set_stream.attribute(selector, text)))
  }
  self.set.attributes = function set_attributes (selector, obj) {
    return mixin(self.through(set_stream.attributes(selector, obj)))
  }
  self.replace = function replace (selector, arg) {
    if (h.isFunction(arg)) {
      var s = replace_stream.outer(selector, wrap_callback(arg))
      return mixin(self.through(s))
    } else {
      return self.set(selector, arg)
    }
  }
  self.replace.inner = function replace_inner (selector, arg) {
    if (h.isFunction(arg)) {
      var s = replace_stream.inner(selector, wrap_callback(arg))
      return mixin(self.through(s))
    } else {
      return self.set.inner(selector, arg)
    }
  }
  self.replace.attribute = function replace_attribute (selector, attr, cb) {
    var replace_attr = replace_stream.attribute(selector, attr, cb)
    return mixin(self.through(replace_attr))
  }
  self.replace.attributes = function replace_attributes (selector, obj) {
    var replace_attrs = replace_stream.attributes(selector, obj)
    return mixin(self.through(replace_attrs))
  }
  self.map = function map (callback) {
    return mixin(map_stream(self, function (stream, data) {
      return callback(mixin(stream), data)
    }))
  }
  return self
}

function rheo (text) {
  var parse = h.pipeline(function (s) {
    return s.through(parse_stream())
  })
  if (arguments.length > 0) {
    if (h.isString(text)) h([text]).pipe(parse)
    else if (h.isUndefined(text)) h([]).pipe(parse)
    else if (h.isFunction(text.pipe)) text.pipe(parse)
    else if (h.isFunction(text.toString)) h([text.toString()]).pipe(parse)
  }
  return mixin(parse)
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
    return callback(mixin(h(stream)))
  }
}
