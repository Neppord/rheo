var tokenizer = require('html-tokenize')
module.exports = function start () {
  var stream = tokenizer()
  stream.isClosed = true
  return stream
}
