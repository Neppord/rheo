// Need to export before we include if they include us
module.exports = rheo
rheo.chain = chain
rheo.from_tokens = chain
rheo.pipeline = chain
rheo.mixin = mixin

var h = require('highland')
var select_stream = require('html-select')
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
    var ret = rheo.chain()
    select(selector, function (element) {
      element.createReadStream().pipe(ret)
    })
    return ret
  }
  self.render = function render () {
    return mixin(self.select, self.through(render_stream()))
  }
  self.replace = function replace (selector, arg) {
    select(selector, function (element) {
      if (h.isFunction(arg)) {
        wrap_callback(arg)(element.createReadStream())
          .pipe(element.createWriteStream())
      } else {
        arg.pipe(element.createWriteStream())
      }
    })
    return self
  }
  self.replace.inner = function replace_inner (selector, arg) {
    select(selector, function (element) {
      if (h.isFunction(arg)) {
        wrap_callback(arg)(element.createReadStream({inner: true}))
          .pipe(element.createWriteStream({inner: true}))
      } else {
        arg.pipe(element.createWriteStream({inner: true}))
      }
    })
    return self
  }
  self.replace.attribute = function replace_attribute (selector, attr, cb) {
    select(selector, function (element) {
      if (h.isFunction(cb)) {
        element.setAttribute(attr, cb(element.getAttribute(attr)))
      } else {
        element.setAttribute(attr, cb)
      }
    })
    return self
  }
  self.set = self.replace
  self.replace.attributes = function replace_attributes (selector, obj) {
    select(selector, function (element) {
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          var cb = obj[attr]
          if (h.isFunction(cb)) {
            element.setAttribute(attr, cb(element.getAttribute(attr)))
          } else {
            element.setAttribute(attr, cb)
          }
        }
      }
    })
    return self
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
