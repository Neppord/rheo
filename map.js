module.exports = Map

module.exports = Map
var Rheo = require('./rheo')
var util = require('util')
var Deque = require('double-ended-queue')

util.inherits(Map, Rheo)

function Map (rheo_template, callback) {
  var template_queue = new Deque()
  var self = this
  Rheo.call(this, {objectMode: true})
  this.template = null
  this.rheo_template = rheo_template
  this.callback = callback
  rheo_template.on('data', function (data) {
    template_queue.enqueue.apply(template_queue, data.toArray())
  })
  rheo_template.once('end', function (data) {
    if (data) template_queue.enqueue.apply(template_queue, data.toArray())
    self.template = template_queue.toArray()
  })
}

Map.prototype._transform = function (data, enc, cb) {
  var self = this
  if (this.template === null) {
    this.rheo_template.once('end', function () {
      self._transform(data, enc, cb)
    })
  } else {
    var write_stream = new Rheo({objectMode: true})
    var read_stream = this.callback(write_stream, data)
    var ret = new Deque()
    write_stream.end(new Deque(this.template))
    read_stream.on('data', function (queue) {
      ret.enqueue.apply(ret, queue.toArray())
    })
    read_stream.once('end', function (queue) {
      if (queue) ret.enqueue.applye(ret, queue.toArray())
      self.push(ret)
      cb()
    })
  }
}

Map.prototype._flush = function (cb) {
  cb()
}

