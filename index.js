module.exports = rheo
var Parse = require('./parse')
var Pipeline = require('./pipeline')
var Rheo = require('./rheo')

rheo.chain = rheo.pipeline = pipeline

function rheo (html) {
  if (arguments.length === 0) return new Parse()
  else {
    var r = new Parse()
    r.end(html)
    return r
  }
}

function pipeline (callback) {
  if (callback) return new Pipeline(callback)
  else return new Rheo({objectMode: true})
}

