module.exports = Outer

var Deque = require('double-ended-queue')
var util = require('util')

var cssauron = require('./cssauron')
var Rheo = require('./rheo')
var Document = require('./document')

util.inherits(Outer, Rheo)

function Outer (selector, callback) {
  Rheo.call(this, {objectMode: true})
  this.callback = callback
  this.state = BEFORE
  this.check = cssauron(selector)
  this.before = new Deque()
  this.after = new Deque()
  this.through = new Deque()
  this.open = null
  this.document = new Document()
}
var BEFORE = {}
var THROUGH = {}
var AFTER = {}

Outer.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this.state) {
      case BEFORE:
        if (obj.type === 'open') {
          if (this.check(obj)) {
            this.open = obj
            this.parent = obj.parent
            this.document.add_child(obj)
            this.through.enqueue(obj)
            this.state = THROUGH
          } else {
            this.before.enqueue(obj)
          }
        } else {
          this.before.enqueue(obj)
        }
        break
      case THROUGH:
        if (obj.type === 'close' && obj.open === this.open) this.state = AFTER
        this.through.enqueue(obj)
        break
      case AFTER:
        this.after.enqueue(obj)
        break
    }
    obj = queue.dequeue()
  }
  cb()
}

Outer.prototype._flush = function (cb) {
  var accum = new Deque()
  var self = this
  var rheo = new Rheo({objectMode: true})
  var callback = this.callback
  rheo.end(this.through)
  var ret = callback(rheo)
  this.push(this.before)
  ret.on('data', function (queue) {
    accum.enqueue.apply(accum, queue.toArray())
  })
  ret.once('end', function (queue) {
    if (queue) accum.enqueue.apply(accum, queue.toArray())
    var document = accum.peekFront().parent
    document.move_children(self.parent)
    accum.enqueue.apply(accum, self.after.toArray())
    self.push(accum)
    cb()
  })
}

