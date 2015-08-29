module.exports = Atribute
var Rheo = require('./rheo')
var util = require('util')
var cssauron = require('./cssauron')
var Deque = require('double-ended-queue')

util.inherits(Atribute, Rheo)

function Atribute (selector, hash) {
  Rheo.call(this, {objectMode: true})
  this.hash = hash
  this.state = BEFORE
  this.check = cssauron(selector)
}

var BEFORE = {}
var AFTER = {}

Atribute.prototype._transform = function (queue, enc, cb) {
  var ret = new Deque(queue.length)
  var obj = queue.dequeue()
  while (obj !== undefined) {
    switch (this.state) {
      case BEFORE:
        if (obj.type === 'open' && this.check(obj)) {
          var hash = this.hash
          for (var key in hash) {
            if (hash.hasOwnProperty(key)) {
              var func = hash[key]
              var attr = func(obj.attrs[key])
              obj.attrs[key] = attr
            }
          }
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

Atribute.prototype._flush = function (cb) {
  cb()
}

