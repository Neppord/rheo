var h = require('highland')
var repeat = require('../repeat')

module.exports = map

function map (template, callback) {
  var stream_of_templates = template
    .pipe(h())
    .collect()
    .flatMap(repeat)
    .map(function (array) {
      return h(array)
        .map(function (token) {
          return token.map(function (o) {return o})
        })
    })
  return h.pipeline(function (s) {
    return s
      .zip(stream_of_templates)
      .flatMap(function (pair) {
        return callback(pair[1], pair[0]).pipe(h())
      })
  })
}
