module.exports = Find
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(Find, Rheo)

function Find (selector) {
  Rheo.call(this, {objectMode: true})
  this.state = BEFORE
  this.check = cssauron(selector)
  this.through = new Deque()
}
var BEFORE = {}
var THROUGH = {}
var AFTER = {}

Find.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    if (this.state === BEFORE) {
      if (obj.type === 'open') {
        if (this.check(obj)) {
          this.open = obj
          this.through.enqueue(obj)
          this.state = THROUGH
        }
      }
    } else if (this.state === THROUGH) {
      if (obj.type === 'close' && obj.open === this.open) this.state = AFTER
      this.through.enqueue(obj)
    }
    obj = queue.dequeue()
  }
  cb()
}

Find.prototype._flush = function (cb) {
  this.push(this.through)
  cb()
}

