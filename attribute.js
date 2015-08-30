module.exports = Attribute
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(Attribute, Rheo)

function Attribute (selector, attribute, callback) {
  Rheo.call(this, {objectMode: true})
  this._callback = callback
  this._attribute = attribute
  this._state = BEFORE
  this._check = cssauron(selector)
}

var BEFORE = {}
var AFTER = {}

Attribute.prototype._transform = function (queue, enc, cb) {
  var ret = new Deque(queue.length)
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this._state) {
      case BEFORE:
        if (obj.type === 'open' && this._check(obj)) {
          obj.attrs[this._attribute] = this._callback(obj.attrs[this._attribute])
          this._state = AFTER
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

