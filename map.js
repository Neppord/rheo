var h = require('highland')
var repeat = require('./repeat')
var river = require('./')

module.exports = map

function map (template, callback) {
  var stream_of_templates = h(template)
    .collect().flatMap(repeat).map(function (array) {
      return river.mixin(h(array))
    })
  return h.pipeline(function (s) {
    return s
      .zip(stream_of_templates)
      .flatMap(function (pair) {
        return callback(pair[1], pair[0]).pipe(h())
      })
  })
}
