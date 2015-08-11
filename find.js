var h = require('highland')
var select = require('html-select')

module.exports = function find (selector, opts) {
  return h.pipeline(function (s) {
    var p = h()
    var stream_created = false
    s.pipe(select(selector, function (elem) {
      if (!stream_created) {
        stream_created = true
        elem
          .createReadStream(opts)
          .pipe(p)
      }
    }))
    .once('end', function () {
      if (!stream_created) p.end()
    })
    .resume()
    return p
  })
}
