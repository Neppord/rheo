module.exports = Parse

var Rheo = require('./rheo')
var util = require('util')
var htmlparser2 = require('htmlparser2')
var Deque = require('double-ended-queue')

util.inherits(Parse, Rheo)

function Parse () {
  Rheo.call(this, {objectMode: true})
  this.queue = new Deque()
  this.parser = new htmlparser2.Parser({
    onopentag: this._onopentag.bind(this),
    onclosetag: this._onclosetag.bind(this),
    ontext: this._ontext.bind(this)
  })
}

Parse.prototype._onopentag = function (name, attrs) {
  this.queue.enqueue({
    type: 'open',
    name: name,
    attrs: attrs
  })
}

Parse.prototype._onclosetag = function (name) {
  this.queue.enqueue({
    type: 'close',
    name: name
  })
}

Parse.prototype._ontext = function (text) {
  this.queue.enqueue({
    type: 'text',
    value: text
  })
}

Parse.prototype._transform = function (str, enc, cb) {
  this.parser.write(str)
  cb()
}

Parse.prototype._flush = function (cb) {
  this.parser.end()
  this.push(this.queue)
  cb()
}
