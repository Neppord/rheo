/* global describe it */
var expect = require('chai').expect

var h = require('highland')

var rheo = require('./')

var html = '<html><body><h1>Hello World</h1></body></html>'
var h1 = '<h1>Hello World</h1>'
var h1_bold = '<h1 class="bold">Hello World</h1>'
var top_heading = '<h1 class="bold" id="top_heading">Hello World</h1>'
var hello_rheobank = '<html><body><h1>Hello Riverbank</h1></body></html>'
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
  it('handles empty strings', function (done) {
    var template = rheo('')
    should_render(done, template, '')
  })
  it('exctracts subtemplates', function (done) {
    var template = rheo(html)
     .find('h1')
    should_render(done, template, h1)
  })
  it('replaces content', function (done) {
    var template = rheo(html)
      .replace('h1', function (subtemplate) {
        return rheo('<h1>Hello Riverbank</h1>')
      })
    should_render(done, template, hello_rheobank)
  })
  it('replaces content with a given stream', function (done) {
    var template = rheo(html)
      .replace('h1', rheo('<h1>Hello Riverbank</h1>'))
    should_render(done, template, hello_rheobank)
  })
  it('replaces inner content', function (done) {
    var template = rheo(html)
      .replace.inner('h1', function (subtemplate) {
        return rheo('Hello Riverbank')
      })
    should_render(done, template, hello_rheobank)
  })
  it('replaces inner content a given stream', function (done) {
    var template = rheo(html)
      .replace.inner('h1', rheo('Hello Riverbank'))
    should_render(done, template, hello_rheobank)
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
          return rheo('Hello Riverbank')
        })
      })
    should_render(done, template, hello_rheobank)
  })
  it('tranforms data to html', function (done) {
    var template = rheo(pet_template)
      .map(function (t, data) {
        return t.replace.inner('.pet-name', function () {
          return rheo(data.name)
        }).replace.inner('.pet-type', function () {
          return rheo(data.type)
        }).replace.inner('.pet-age', function () {
          return rheo(data.age.toString())
        })
      })
    pet_stream().pipe(template)
    should_render(done, template, fluffy_puff_html + fluffy_puff_html)
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

function should_render (done, template, html) {
  h(template.render()).toArray(function (fragments) {
    var text = fragments.join('')
    expect(text).to.deep.equal(html)
    done()
  })

}

function pet_stream () {
  return h([
    {name: 'Fluffy Puff', type: 'Rabbit', age: 3},
    {name: 'Fluffy Puff', type: 'Rabbit', age: 3}
  ])
}
