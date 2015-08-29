/* global describe it */
var fs = require('fs')

var h = require('highland')

var should_render = require('./spec_helpers/should_render')
var expect = require('chai').expect

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
    checker(done, html)(rheo(html).render())
  })
  it('takes stringables as input', function (done) {
    checker(done, '0')(rheo(0).render())
  })
  it('handles empty strings', function (done) {
    checker(done, '')(rheo('').render())
  })
  it('exctracts subtemplates', function (done) {
    checker(done, h1)(rheo(html).find('h1').render())
  })
  it('exctracts only first subtemplates', function (done) {
    checker(done, h1)(rheo(html_with_multiple_h1).find('h1').render())
  })
  it('replaces content', function (done) {
    checker(done, hello_rheo)(rheo(html).replace('h1', callback).render())
    function callback (subtemplate) {
      return rheo('<h1>Hello Rheo</h1>')
    }
  })
  it('replaces content with a given stream', function (done) {
    var stream = rheo('<h1>Hello Rheo</h1>')
    checker(done, hello_rheo)(rheo(html).replace('h1', stream).render())
  })
  it('replaces inner content', function (done) {
    checker(done, hello_rheo)(rheo(html).inner('h1', callback).render())
    function callback (subtemplate) {
      return rheo('Hello Rheo')
    }
  })
  it('replaces inner content a given stream', function (done) {
    var stream = rheo('Hello Rheo')
    checker(done, hello_rheo)(rheo(html).inner('h1', stream).render())
  })
  it('chains when replacing content', function (done) {
    checker(done, fluffy_puff_html)(
    rheo(pet_template)
      .inner('.pet-name', function () {
        return rheo('Fluffy Puff')
      }).inner('.pet-type', function () {
        return rheo('Rabbit')
      }).inner('.pet-age', function () {
        return rheo('3')
      }).render()
    )
  })
  it('gives you the content you replace', function (done) {
    checker(done, hello_rheo)(rheo(html).replace('h1', callback).render())
    function callback (h1_template) {
      return h1_template.inner('h1', rheo('Hello Rheo'))
    }
  })
  it('replace menus with data driven html', function (done) {
    var result = '<ul class="menu"></ul>\n'
    checker(done, result)(rheo(layout_with_menu).inner('.menu', callback).render())
    function callback (t) {
      return h([]).pipe(t.map(function (t, d) {return t}))
    }
  })
  it('replace menus with example driven html', function (done) {
    var result = (
      '<ul class="menu"><li class="menu-item selected">\n' +
      '    <a class="menu-link menu-title active" href="#">\n' +
      '      link title\n' +
      '    </a>\n' +
      '  </li></ul>\n'
    )
    checker(done, result)(rheo(layout_with_menu).inner('.menu', callback).render())
    function callback (t) {
      return h([1]).pipe(
        t.find('.selected').map(function (t, d) {return t})
      )
    }
  })
  it('replaces attributes', function (done) {
    checker(done, h1_bold)(rheo(h1).attribute('h1', 'class', function () {
      return 'bold'
    }).render())
  })
  it('replaces attributes with shorthand', function (done) {
    checker(done, h1_bold)(rheo(h1).attribute('h1', 'class', 'bold').render())
  })
  it.skip('replaces multiple attributes', function (done) {
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
  it.skip('replaces multiple attributes with shorthand', function (done) {
    var template = rheo(h1)
      .replace.attributes('h1', {
        'class': 'bold',
        'id': 'top_heading'
      })
    should_render(done, template, top_heading)
  })
  it.skip('creates pipelines easy with chain', function (done) {
    var template = rheo(html)
    var pipeline = rheo.chain(function (stream) {
      return stream
        .find('h1')
        .replace.attribute('h1', 'class', function () {return 'bold'})
    })
    should_render(done, template.pipe(pipeline), h1_bold)
  })
})

function checker (done, html) {
  var result = ''
  function data (data) {
    result += data
  }
  function end (data) {
    if (data) result += data
    expect(result).to.equal(html)
    done()
  }
  function helper (stream) {
    stream.on('data', data)
    return stream.on('end', end)
  }
  helper.data = data
  helper.end = end
  return helper
}
