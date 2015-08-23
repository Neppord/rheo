module.exports = Rheo
var util = require('util')
var Transform = require('stream').Transform

util.inherits(Rheo, Transform)

function Rheo (opts) {
  Transform.call(this, opts)
}

Rheo.prototype.render = function () {
  var Render = require('./render')
  return this.pipe(new Render())
}
