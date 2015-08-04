var select = require('html-select')

module.exports = set
set.outer = outer
set.inner = inner
set.attribute = attribute
set.attributes = attributes

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

function attribute (selector, text) {
  return select(selector, function (element) {
    element.setAttribute(text)
  })
}

function attributes (selector, obj) {
  return select(selector, function (element) {
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        element.setAttribute(attr, obj[attr])
      }
    }
  })
}
