module.exports = Pipeline
var Rheo = require('./rheo')
var util = require('util')

util.inherits(Pipeline, Rheo)

function Pipeline (callback) {
  Rheo.call(this, {objectMode: true})
  this.write_stream = new Rheo({objectMode: true})
  this.read_stream = callback(this.write_stream)
  this.read_stream.on('data', this.push.bind(this))
}

Pipeline.prototype._transform = function (queue, enc, cb) {
  this.write_stream.write(queue)
  cb()
}

Pipeline.prototype._flush = function (cb) {
  var self = this
  this.read_stream.once('end', function (queue) {
    if (queue) self.push(queue)
    cb()
  })
  this.write_stream.end()
}

