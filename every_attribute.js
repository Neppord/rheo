module.exports = EveryAttribute
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(EveryAttribute, Rheo)

function EveryAttribute (selector, attribute, callback) {
  Rheo.call(this, {objectMode: true})
  this._callback = callback
  this._attribute = attribute
  this._check = cssauron(selector)
}

EveryAttribute.prototype._transform = function (queue, enc, cb) {
  var ret = new Deque(queue.length)
  var obj = queue.dequeue()
  while (obj !== undefined) {
    if (obj.type === 'open' && this._check(obj)) {
      obj.attrs[this._attribute] = this._callback(obj.attrs[this._attribute])
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

