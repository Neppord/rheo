// Need to export before we include if they include us
module.exports = rheo
rheo.from_tokens = from_tokens
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
  self.replace = function replace (selector, cb) {
    return mixin(self.pipe(replace_stream.outer(selector, cb)))
  }
  self.replace.inner = function replace_inner (selector, cb) {
    return mixin(self.pipe(replace_stream.inner(selector, cb)))
  }
  self.replace.attribute = function replace_attribute (selector, attr, cb) {
    var replace_attr = replace_stream.attribute(selector, attr, cb)
    return mixin(self.pipe(replace_attr))
  }
  self.map = function map (callback) {
    return mixin(map_stream(self, callback))
  }
  return self
}

function rheo (text) {
  var rheo = mixin(parse_stream())
  if (text) rheo.end(text)
  return rheo
}

function from_tokens (token) {
  var rheo = mixin(h())
  if (token) rheo.end(token)
  return rheo
}
