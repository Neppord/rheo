module.exports = EveryAttribute
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(EveryAttribute, Rheo)

function EveryAttribute (selector, attribute, callback) {
  Rheo.call(this, {objectMode: true})
  this.callback = callback
  this.attribute = attribute
  this.check = cssauron(selector)
}

EveryAttribute.prototype._transform = function (queue, enc, cb) {
  var ret = new Deque(queue.length)
  var obj = queue.dequeue()
  while (obj !== undefined) {
    if (obj.type === 'open' && this.check(obj)) {
      obj.attrs[this.attribute] = this.callback(obj.attrs[this.attribute])
    }
    ret.enqueue(obj)
    obj = queue.dequeue()
  }
  this.push(ret)
  cb()
}

EveryAttribute.prototype._flush = function (cb) {
  cb()
}

