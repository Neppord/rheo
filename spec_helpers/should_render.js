module.exports = should_render

var h = require('highland')
var expect = require('chai').expect
var render = require('../render')

function should_render (done, template, html) {
  h(template.pipe(render())).toArray(function (fragments) {
    var text = fragments.join('')
    expect(text).to.deep.equal(html)
    done()
  })

}
