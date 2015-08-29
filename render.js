module.exports = Render
var Rheo = require('./rheo')
var util = require('util')

util.inherits(Render, Rheo)

function Render () {
  Rheo.call(this, {objectMode: true})
}

Render.prototype._transform = function (queue, enc, cb) {
  var obj = queue.dequeue()
  while (obj !== undefined) {
    if (obj.type === 'text') {
      this.push(obj.value)
    } else if (obj.type === 'open') {
      var attrs = obj.attrs
      var text = '<' + obj.name
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          text = text + ' ' + key + '="' + attrs[key].replace('"', '&quot;') + '"'
        }
      }
      text = text + '>'
      this.push(text)
    } else if (obj.type === 'close') {
      this.push('</' + obj.name + '>')
    }
    obj = queue.dequeue()
  }
  cb()
}

Render.prototype._flush = function (cb) {
  cb()
}

