// Need to export before we include if they include us
module.exports = rheo
rheo.chain = chain
rheo.from_tokens = chain
rheo.pipeline = chain
rheo.mixin = mixin

var h = require('highland')
var select_stream = require('html-select')
var find_stream = require('./find')
var set_stream = require('./set')
var replace_stream = require('./replace')
var parse_stream = require('./parse')
var render_stream = require('./render')
var map_stream = require('./map')
var verify_stream = require('./verify')

function mixin (select, self) {
  self.select = select
  self.verify = function verify () {
    return mixin(self.select, self.through(verify_stream()))
  }
  self.find = function find (selector) {
    return mixin(self.select, self.through(find_stream(selector)))
  }
  self.render = function render () {
    return mixin(self.select, self.through(render_stream()))
  }
  self.set = function set (selector, stream) {
    return mixin(self.select, self.through(set_stream.outer(selector, stream)))
  }
  self.set.inner = function set_inner (selector, stream) {
    return mixin(self.select, self.through(set_stream.inner(selector, stream)))
  }
  self.set.attribute = function set_attribute (selector, text) {
    return mixin(self.select, self.through(set_stream.attribute(selector, text)))
  }
  self.set.attributes = function set_attributes (selector, obj) {
    return mixin(self.select, self.through(set_stream.attributes(selector, obj)))
  }
  self.replace = function replace (selector, arg) {
    if (h.isFunction(arg)) {
      select(selector, function (element) {
        wrap_callback(arg)(element.createReadStream())
          .pipe(element.createWriteStream())
      })
      return self
    } else {
      return self.set(selector, arg)
    }
  }
  self.replace.inner = function replace_inner (selector, arg) {
    if (h.isFunction(arg)) {
      select(selector, function (element) {
        wrap_callback(arg)(element.createReadStream({inner: true}))
          .pipe(element.createWriteStream({inner: true}))
      })
      return self
    } else {
      return self.set.inner(selector, arg)
    }
  }
  self.replace.attribute = function replace_attribute (selector, attr, cb) {
    var replace_attr = replace_stream.attribute(selector, attr, cb)
    return mixin(self.select, self.through(replace_attr))
  }
  self.replace.attributes = function replace_attributes (selector, obj) {
    var replace_attrs = replace_stream.attributes(selector, obj)
    return mixin(self.select, self.through(replace_attrs))
  }
  self.map = function map (callback) {
    return mixin(self.select, map_stream(self, function (stream, data) {
      return callback(mixin(self.select, stream), data)
    }))
  }
  return self
}

function rheo (text) {
  var select = select_stream()
  var parse = h.pipeline(function (s) {
    return s
      .pipe(parse_stream())
      .pipe(select)
      .pipe(h())
  })
  if (arguments.length > 0) {
    if (h.isString(text)) h([text]).pipe(parse)
    else if (h.isUndefined(text)) h([]).pipe(parse)
    else if (h.isFunction(text.pipe)) text.pipe(parse)
    else if (h.isFunction(text.toString)) h([text.toString()]).pipe(parse)
  }
  return mixin(select.select.bind(select), parse)
}

function chain (func) {
  var select = select_stream()
  if (h.isFunction(func)) {
    return mixin(select.select.bind(select), h.pipeline(function (stream) {
      return func(mixin(select.select.bind(select), h(stream.pipe(select))))
    }))
  } else {
    return mixin(select.select.bind(select), h.pipeline(function (s) {
      return s.pipe(select).pipe(h())
    }))
  }
}

function wrap_callback (callback) {
  var select = select_stream()
  return function (stream) {
    return callback(mixin(select.select.bind(select), h(stream.pipe(select))))
  }
}
