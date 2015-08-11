/* global describe it */
var fs = require('fs')

var h = require('highland')

var should_render = require('./spec_helpers/should_render')

var rheo = require('./')

var html = fs.readFileSync('test_data/html.html').toString()
var html_with_multiple_h1 = fs.readFileSync('test_data/html_with_multiple_h1.html').toString()
var layout_with_menu = fs.readFileSync('test_data/layout_with_menu.html').toString()
var h1 = '<h1>Hello World</h1>'
var h1_bold = '<h1 class="bold">Hello World</h1>'
var top_heading = '<h1 class="bold" id="top_heading">Hello World</h1>'
var hello_rheo = fs.readFileSync('test_data/hello_rheo.html').toString()
var pet_template = (
  '<div class="pet">' +
  '<h1 class="pet-name"></h1>' +
  '<div class="pet-type"></div>' +
  '<div class="pet-age"></div>' +
  '</div>'
)
var fluffy_puff_html = (
  '<div class="pet">' +
  '<h1 class="pet-name">Fluffy Puff</h1>' +
  '<div class="pet-type">Rabbit</div>' +
  '<div class="pet-age">3</div>' +
  '</div>'
)

describe('rheo', function () {
  it('takes html as input', function (done) {
    var template = rheo(html)
    should_render(done, template, html)
  })
  it('takes stringables as input', function (done) {
    var template = rheo(0)
    should_render(done, template, '0')
  })
  it('handles empty strings', function (done) {
    var template = rheo('')
    should_render(done, template, '')
  })
  it('exctracts subtemplates', function (done) {
    var template = rheo(html)
     .find('h1')
    should_render(done, template, h1)
  })
  it('exctracts only first subtemplates', function (done) {
    var template = rheo(html_with_multiple_h1)
     .find('h1')
    should_render(done, template, h1)
  })
  it('replaces content', function (done) {
    var template = rheo(html)
      .replace('h1', function (subtemplate) {
        return rheo('<h1>Hello Rheo</h1>')
      })
    should_render(done, template, hello_rheo)
  })
  it('replaces content with a given stream', function (done) {
    var template = rheo(html)
      .replace('h1', rheo('<h1>Hello Rheo</h1>'))
    should_render(done, template, hello_rheo)
  })
  it('replaces inner content', function (done) {
    var template = rheo(html)
      .replace.inner('h1', function (subtemplate) {
        return rheo('Hello Rheo')
      })
    should_render(done, template, hello_rheo)
  })
  it('replaces inner content a given stream', function (done) {
    var template = rheo(html)
      .replace.inner('h1', rheo('Hello Rheo'))
    should_render(done, template, hello_rheo)
  })
  it('set the inner content a given stream', function (done) {
    var template = rheo(html)
      .set.inner('h1', rheo('Hello Rheo'))
    should_render(done, template, hello_rheo)
  })
  it('chains when replacing content', function (done) {
    var template = rheo(pet_template)
      .replace.inner('.pet-name', function () {
        return rheo('Fluffy Puff')
      }).replace.inner('.pet-type', function () {
        return rheo('Rabbit')
      }).replace.inner('.pet-age', function () {
        return rheo('3')
      })
    should_render(done, template, fluffy_puff_html)
  })
  it('gives you the content you replace', function (done) {
    var template = rheo(html)
      .replace('h1', function (h1_template) {
        return h1_template.replace.inner('h1', function () {
          return rheo('Hello Rheo')
        })
      })
    should_render(done, template, hello_rheo)
  })
  it('replace menus with data driven html', function (done) {
    var template = rheo(layout_with_menu)
      .replace.inner('.menu', function (t) {
        return h([]).pipe(t.map(function (t, d) {return t}))
      })
    should_render(done, template, '<ul class="menu"></ul>\n')
  })
  it('replace menus with example driven html', function (done) {
    var template = rheo(layout_with_menu)
      .replace.inner('.menu', function (t) {
        return h([1]).pipe(
          t
            .find('.selected')
            .map(function (t, d) {return t})
        )
      })
    should_render(done, template, (
      '<ul class="menu"><li class="menu-item selected">\n' +
      '    <a class="menu-link menu-title active" href="#">\n' +
      '      link title\n' +
      '    </a>\n' +
      '  </li></ul>\n'
    ))
  })
  it('replaces attributes', function (done) {
    var template = rheo(h1)
      .replace.attribute('h1', 'class', function () {
        return 'bold'
      })
    should_render(done, template, h1_bold)
  })
  it('replaces attributes with shorthand', function (done) {
    var template = rheo(h1)
      .replace.attribute('h1', 'class', 'bold')
    should_render(done, template, h1_bold)
  })
  it('replaces multiple attributes', function (done) {
    var template = rheo(h1)
      .replace.attributes('h1', {
        'class': function () {
          return 'bold'
        },
        'id': function () {
          return 'top_heading'
        }
      })
    should_render(done, template, top_heading)
  })
  it('replaces multiple attributes with shorthand', function (done) {
    var template = rheo(h1)
      .replace.attributes('h1', {
        'class': 'bold',
        'id': 'top_heading'
      })
    should_render(done, template, top_heading)
  })
  it('creates pipelines easy with chain', function (done) {
    var template = rheo(html)
    var pipeline = rheo.chain(function (stream) {
      return stream
        .find('h1')
        .replace.attribute('h1', 'class', function () {return 'bold'})
    })
    should_render(done, template.pipe(pipeline), h1_bold)
  })
})
