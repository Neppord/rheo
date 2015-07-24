var h = require('highland')
module.exports = function (value) {
  return h(function (push, next) {
    push(null, value)
    next()
  })
}
