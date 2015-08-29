module.exports = Attribute
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(Attribute, Rheo)

function Attribute (selector, attribute, callback) {
  Rheo.call(this, {objectMode: true})
  this.callback = callback
  this.attribute = attribute
  this.state = BEFORE
  this.check = cssauron(selector)
}

var BEFORE = {}
var AFTER = {}

Attribute.prototype._transform = function (queue, enc, cb) {
  var ret = new Deque(queue.length)
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this.state) {
      case BEFORE:
        if (obj.type === 'open' && this.check(obj)) {
          obj.attrs[this.attribute] = this.callback(obj.attrs[this.attribute])
          this.state = AFTER
        }
        ret.enqueue(obj)
        break
      case AFTER:
        ret.enqueue(obj)
        break
    }
    obj = queue.dequeue()
  }
  this.push(ret)
  cb()
}

Attribute.prototype._flush = function (cb) {
  cb()
}

