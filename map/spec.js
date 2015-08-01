/*global describe it beforeEach*/
var h = require('highland')
var map = require('./')
var parse = require('../parse')
var should_render = require('../spec_helpers/should_render')

describe('map', function () {
  var html = '<li></li>'
  var template

  beforeEach(function () {
    var tokens = parse()
    template = map(tokens, id)
    tokens.end(html)
  })

  it('takes data in', function () {
    h().pipe(map(h(), id))
  })
  it('renders zero', function (done) {
    template.end()
    should_render(done, template, '')
  })
  it('renders one', function (done) {
    template.write({})
    template.end()
    should_render(done, template, html)
  })
  it('renders many ', function (done) {
    template.write({})
    template.write({})
    template.end()
    should_render(done, template, html + html)
  })

  it('gives the data to the render function', function (done) {
    template.write({})
    template.write({})
    template.end()
    should_render(done, template, html + html)
  })
})

function id (o) {
  return o
}
