module.exports = Map

module.exports = Map
var util = require('util')
var Deque = require('double-ended-queue')

var Rheo = require('./rheo')
var rheo = require('./')
var Document = require('./document')
util.inherits(Map, Rheo)

function Map (rheo_template, callback) {
  Rheo.call(this, {objectMode: true})
  var self = this
  this.document = new Document()
  this.html = ''
  this.callback = callback
  this.done_loading = false
  this.rheo_template = rheo_template
    .render()
    .on('data', function (html) {
      self.html += html
    })
    .once('end', function (html) {
      if (html) self.html += html
      self.done_loading = true
    })
}

Map.prototype._make_rheo = function () {
  return rheo(this._html)
}

Map.prototype._transform = function (data, enc, cb) {
  var self = this
  if (!this.done_loading) {
    this.rheo_template.once('end', function () {
      self.done_loading = true
      self._transform(data, enc, cb)
    })
  } else {
    var write_stream = rheo(this.html)
    var read_stream = this.callback(write_stream, data)
    var accum = new Deque()
    read_stream.on('data', function (queue) {
      accum.enqueue.apply(accum, queue.toArray())
    })
    read_stream.once('end', function (queue) {
      if (queue) accum.enqueue.applye(accum, queue.toArray())
      if (!accum.isEmpty()) {
        var document = accum.peekFront().parent
        document.move_children(self.document)
        self.push(accum)
      }
      cb()
    })
  }
}

Map.prototype._flush = function (cb) {
  cb()
}

