var h = require('highland')
var repeat = require('../repeat')

module.exports = map

function map (template, callback) {
  var stream_of_templates = template
    .pipe(h())
    .collect()
    .flatMap(repeat)
    .map(function (array) {
      return h(array).map(clone_array)
    })
  return h.pipeline(function (s) {
    return s
      .zip(stream_of_templates)
      .flatMap(function (pair) {
        return callback(pair[1], pair[0]).pipe(h())
      })
  })
}

function clone_array (arr) {
  var len = arr.length
  var arr_clone = new Array(len)
  while (len--) arr_clone[len] = arr[len]
  return arr_clone
}
