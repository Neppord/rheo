var h = require('highland')
var select = require('html-select')

module.exports = function find (selector, opts) {
  return h.pipeline(function (s) {
    var p = h()
    s.pipe(select(selector, function (elem) {
      elem.createReadStream(opts).pipe(p)
    }))
    return p
  })
}
