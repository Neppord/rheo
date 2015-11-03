module.exports = Parse

var Rheo = require('./rheo')
var util = require('util')
var htmlparser2 = require('htmlparser2')
var Deque = require('double-ended-queue')

var OpenTag = require('./open_tag')
var OpenComment = require('./open_comment')
var Document = require('./document')

util.inherits(Parse, Rheo)

function Parse () {
  Rheo.call(this, {objectMode: true})
  this.document = new Document()
  this.queue = new Deque()
  this.open_stack = new Deque()
  this.parser = new htmlparser2.Parser({
    onopentag: this._onopentag.bind(this),
    onclosetag: this._onclosetag.bind(this),
    ontext: this._ontext.bind(this),
    oncomment: this._oncomment.bind(this),
    oncommentend: this._oncommentend.bind(this)
  })
}

Parse.prototype._onopentag = function (name, attrs) {
  var parent = (
    this.open_stack.peekBack() ||
    this.document
  )
  var open_tag = new OpenTag(
    name,
    attrs,
    parent
  )
  parent.add_child(open_tag)
  this.open_stack.push(open_tag)
  this.queue.enqueue(open_tag)
}

Parse.prototype._onclosetag = function (name) {
  var open = this.open_stack.pop()
  this.queue.enqueue({
    type: 'close',
    name: name,
    open: open
  })
}

Parse.prototype._ontext = function (text) {
  var open = this.open_stack.peekBack()
  this.queue.enqueue({
    type: 'text',
    value: text,
    parent: open || this.document
  })
}

Parse.prototype._oncomment = function (text) {
  var parent = (
    this.open_stack.peekBack() ||
    this.document
  )
  var open_comment = new OpenComment(
    text,
    parent
  )
  parent.add_child(open_comment)
  this.open_stack.push(open_comment)
  this.queue.enqueue(open_comment)
}

Parse.prototype._oncommentend = function () {
  var open = this.open_stack.pop()
  this.queue.enqueue({
    type: 'close_comment',
    open: open
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
