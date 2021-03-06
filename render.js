module.exports = Render
var Rheo = require('./rheo')
var util = require('util')
var void_elements = require('void-elements')

util.inherits(Render, Rheo)

function Render () {
  Rheo.call(this, {objectMode: true})
}

Render.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    if (obj.type === 'text') {
      this.push(obj.value)
    } else if (obj.type === 'open_comment') {
      this.push('<!--' + obj.value)
    } else if (obj.type === 'close_comment') {
      this.push('-->')
    } else if (obj.type === 'open') {
      var attrs = obj.attrs
      var text = '<' + obj.name
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          text += ' ' + key + '="' + attrs[key].replace('"', '&quot;') + '"'
        }
      }
      text = text + '>'
      this.push(text)
    } else if (obj.type === 'close' && void_elements[obj.name] !== true) {
      this.push('</' + obj.name + '>')
    }
    obj = queue.dequeue()
  }
  cb()
}

Render.prototype._flush = function (cb) {
  cb()
}

