/*global describe it beforeEach*/
var map = require('./')
var parse = require('../parse')
var set = require('../set')
var replace = require('../replace')
var should_render = require('../spec_helpers/should_render')

describe('map', function () {
  var html = '<li></li>'
  var template

  describe('using simple render function', function () {
    function id (o) {
      return o
    }
    beforeEach(function () {
      var tokens = parse()
      template = map(tokens, id)
      tokens.end(html)
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
  })

  describe('using complex renderfunction', function () {
    function render (t, d) {
      var parsed_string = parse()
      parsed_string.end(d.toString())
      return t.pipe(set.inner('li', parsed_string))
    }
    beforeEach(function () {
      var tokens = parse()
      template = map(tokens, render)
      tokens.end(html)
    })
    it('renders many items', function (done) {
      template.write('hello')
      template.write('world')
      template.end()
      should_render(done, template, '<li>hello</li><li>world</li>')
    })
  })

  describe('appending to attribute', function () {
    function render (t, d) {
      return t.pipe(replace.attribute('li', 'class', function (attr) {
        return attr ? attr + ' hidden' : 'hidden'
      }))
    }
    beforeEach(function () {
      var tokens = parse()
      template = map(tokens, render)
      tokens.end(html)
    })
    it('renders many items', function (done) {
      template.write('hello')
      template.write('world')
      template.end()
      should_render(done, template, '<li class="hidden"></li><li class="hidden"></li>')
    })
  })

})

