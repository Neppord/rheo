module.exports = rheo
var Parse = require('./parse')

function rheo (html) {
  if (arguments.length === 0) return new Parse()
  else {
    var r = new Parse()
    r.end(html)
    return r
  }
}

