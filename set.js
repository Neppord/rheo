var select = require('html-select')

module.exports = set
set.outer = outer
set.inner = inner

function set (selector, opts, stream) {
  return select(selector, function (elem) {
    stream.pipe(elem.createWriteStream(opts))
  })
}

function inner (selector, stream) {
  return set(selector, {inner: true}, stream)
}

function outer (selector, stream) {
  return set(selector, {}, stream)
}
