module.exports = Replace
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(Replace, Rheo)

function Replace (selector, callback) {
  Rheo.call(this, {objectMode: true})
  this.callback = callback
  this.state = BEFORE
  this.check = cssauron(selector)
  this.before = new Deque()
  this.after = new Deque()
  this.through = new Deque()
  this.open = null
}
var BEFORE = {}
var THROUGH = {}
var AFTER = {}

Replace.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this.state) {
      case BEFORE:
        if (obj.type === 'open') {
          if (this.check(obj)) {
            this.open = obj
            this.parent = obj.parent
            obj.detatch()
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

Replace.prototype._flush = function (cb) {
  var self = this
  var rheo = new Rheo({objectMode: true})
  var callback = this.callback
  rheo.end(this.through)
  var ret = callback(rheo)
  this.push(this.before)
  ret.on('data', function (queue) {
    self.parent.insert(queue)
    self.push(queue)
  })
  ret.once('end', function (queue) {
    if (queue) {
      self.parent.insert(queue)
      self.push(queue)
    }
    self.push(self.after)
    cb()
  })
}

