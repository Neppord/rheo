module.exports = verify

var h = require('highland')
var void_elements = require('void-elements')

var COMMENT = ''

function verify () {
  return h.pipeline(function (s) {
    var tracker = new Tracker()
    return s
      .consume(tracker.process.bind(tracker))
  })
}

function Tracker () {
  this.stack = []
  this.error = undefined
  this.token = undefined
  this.next = undefined
  this.push = undefined
  this.line_nr = 1
}

Tracker.prototype.process = function (error, token, push, next) {
  this.error = error
  this.token = token
  this.push = push
  this.next = next
  if (this.is_error()) this.handle_error()
  else if (this.is_end()) this.handle_end()
  else this.handle_token()
}

Tracker.prototype.increment_line_nr = function () {
  this.line_nr = this.line_nr + this.token_newlines()
}

Tracker.prototype.token_newlines = function () {
  if (this.token[1]) {
    var text = this.token[1].toString()
    return text.length - text.replace('\n', '').length
  } else return 0
}

Tracker.prototype.handle_token = function () {
  this.increment_line_nr()
  if (this.is_open()) this.handle_open()
  else if (this.is_close()) this.handle_close()
  else if (this.is_text()) this.handle_text()
}

Tracker.prototype.is_error = function () {
  return !!this.error
}

Tracker.prototype.handle_error = function () {
  this.push(this.error)
  this.next()
}

Tracker.prototype.is_end = function () {
  return this.token === h.nil
}

Tracker.prototype.handle_end = function () {
  this.push(null, h.nil)
}

Tracker.prototype.is_open = function () {
  return this.token[0] === 'open'
}

Tracker.prototype.handle_open = function () {
  if (this.is_not_void()) this.stack.push(this.tag_name())
  this.send_token()
}

Tracker.prototype.send_token = function () {
  this.push(null, this.token)
  this.next()
}

Tracker.prototype.is_close = function () {
  return this.token[0] === 'close'
}

Tracker.prototype.handle_close = function () {
  if (this.tags_are_matching()) this.handle_match()
  else this.handle_mismatch()
}

Tracker.prototype.tags_are_matching = function () {
  return this.tag_name() === this.stack[this.stack.length - 1]
}

Tracker.prototype.handle_match = function () {
  this.stack.pop()
  this.send_token()
}

Tracker.prototype.handle_mismatch = function () {
  this.push(new Error(
    'close to line ' +
    this.line_nr +
    ' got closing tag for "' +
    this.tag_name() +
    '" expected "' +
    this.stack[this.stack.length - 1] +
    '"'
  ))
  this.handle_end()
}

Tracker.prototype.is_text = function () {
  return this.token[0] === 'text'
}

Tracker.prototype.handle_text = function () {
  this.send_token()
}

Tracker.prototype.is_not_void = function () {
  return void_elements[this.tag_name()] !== true
}

Tracker.prototype.tag_name = function () {
  var match = this.token[1]
    .toString()
    .match(/^<\/?(\w*)/)
  if (match) {
    return match[1]
  } else {
    return COMMENT
  }
}
