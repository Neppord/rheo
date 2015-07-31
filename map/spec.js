/*global describe it*/
var h = require('highland')
var map = require('./')
var parse = require('../parse')
var should_render = require('../spec_helpers/should_render')

describe('map', function () {
  it('takes data in', function () {
    h().pipe(map(h(), id))
  })
  it('renders tokens', function (done) {
    var html = '<html></html>'
    var tokens = parse()
    tokens.end(html)
    var template = map(tokens, id)

    template.write({})
    template.end()

    should_render(done, template, html)
  })
})

function id (o) {
  return o
}
