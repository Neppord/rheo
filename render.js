var h = require('highland')
module.exports = function () {
  return h().map(push_second_index)
}

function push_second_index (token) {
  return token[1]
}
