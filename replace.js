var select = require('html-select')
var h = require('highland')

replace.inner = inner
replace.outer = outer
replace.attribute = attribute
replace.attributes = attributes
module.exports = replace

function replace (selector, opts, cb) {
  return select(selector, function (elem) {
    var stream = elem.createStream(opts)
    cb(stream).pipe(stream)
  })
}

function inner (selector, cb) {
  return replace(selector, {inner: true}, cb)
}

function outer (selector, cb) {
  return replace(selector, {}, cb)
}

function attribute (selector, attr, cb) {
  return select(selector, function (element) {
    if (h.isFunction(cb)) {
      var value = element.getAttribute(attr)
      var new_value = cb(value)
      element.setAttribute(attr, new_value)
    } else {
      element.setAttribute(attr, cb)
    }
  })
}
function attributes (selector, obj) {
  return select(selector, function (element) {
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        var cb = obj[attr]
        if (h.isFunction(cb)) {
          var value = element.getAttribute(attr)
          var new_value = cb(value)
          element.setAttribute(attr, new_value)
        } else {
          element.setAttribute(attr, cb)
        }
      }
    }
  })
}
