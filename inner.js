module.exports = Inner
var Deque = require('double-ended-queue')
var util = require('util')

var cssauron = require('./cssauron')
var Rheo = require('./rheo')
var Document = require('./document')

util.inherits(Inner, Rheo)

function Inner (selector, callback) {
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

Inner.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this.state) {
      case BEFORE:
        if (obj.type === 'open') {
          if (this.check(obj)) {
            this.open = obj
            this.state = THROUGH
          }
          this.before.enqueue(obj)
        } else {
          this.before.enqueue(obj)
        }
        break
      case THROUGH:
        if (obj.parent === this.open) this.document.add_child(obj)
        if (obj.type === 'close' && obj.open === this.open) {
          this.state = AFTER
          this.after.enqueue(obj)
        } else {
          this.through.enqueue(obj)
        }
        break
      case AFTER:
        this.after.enqueue(obj)
        break
    }
    obj = queue.dequeue()
  }
  cb()
}

Inner.prototype._flush = function (cb) {
  if (this.state === BEFORE) {
    this.push(this.before)
    cb()
  } else {
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
      if (!accum.isEmpty()) {
        var document = accum.peekFront().parent
        document.move_children(self.open)
      }
      accum.enqueue.apply(accum, self.after.toArray())
      self.push(accum)
      cb()
    })
  }
}
