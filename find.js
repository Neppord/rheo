module.exports = Find
var util = require('util')
var Deque = require('double-ended-queue')

var cssauron = require('./cssauron')
var Rheo = require('./rheo')
var Document = require('./document')

util.inherits(Find, Rheo)

function Find (selector) {
  Rheo.call(this, {objectMode: true})
  this.state = BEFORE
  this.check = cssauron(selector)
  this.through = new Deque()
  this.document = new Document()
}
var BEFORE = {}
var THROUGH = {}
var AFTER = {}

Find.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this.state) {
      case BEFORE:
        if (obj.type === 'open') {
          if (this.check(obj)) {
            this.open = obj
            this.document.add_child(obj)
            this.through.enqueue(obj)
            this.state = THROUGH
          }
        }
        break
      case THROUGH:
        if (obj.type === 'close' && obj.open === this.open) this.state = AFTER
        this.through.enqueue(obj)
        break
    }
    obj = queue.dequeue()
  }
  cb()
}

Find.prototype._flush = function (cb) {
  this.push(this.through)
  cb()
}

