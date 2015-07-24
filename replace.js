var select = require('html-select')
var river = require('./')

replace.inner = inner
replace.outer = outer
module.exports = replace

function replace (selector, opts, cb) {
  return select(selector, function (elem) {
    var stream = elem.createStream(opts)
    cb(river.mixin(stream)).pipe(stream)
  })
}

function inner (selector, cb) {
  return replace(selector, {inner: true}, cb)
}

function outer (selector, cb) {
  return replace(selector, {}, cb)
}
