/* global describe it */
var expect = require('chai').expect

var h = require('highland')

var rheo = require('./')

var html = '<html><body><h1>Hello World</h1></body></html>'
var h1 = '<h1>Hello World</h1>'
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
    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(html)
      done()
    })
  })
  it('exctracts subtemplates', function (done) {
    var template = rheo(html)
     .find('h1')
    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(h1)
      done()
    })
  })
  it('replaces content', function (done) {
    var template = rheo(html)
      .replace('h1', function (subtemplate) {
        return rheo('<h1>Hello Riverbank</h1>')
      })
    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(hello_rheobank)
      done()
    })
  })
  it('replaces inner content', function (done) {
    var template = rheo(html)
      .replace.inner('h1', function (subtemplate) {
        return rheo('Hello Riverbank')
      })
    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(hello_rheobank)
      done()
    })
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
    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(fluffy_puff_html)
      done()
    })
  })
  it('gives you the content you replace', function (done) {
    var template = rheo(html)
      .replace('h1', function (h1_template) {
        return h1_template.replace.inner('h1', function () {
          return rheo('Hello Riverbank')
        })
      })

    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(hello_rheobank)
      done()
    })
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
    h(template.render()).toArray(function (fragments) {
      var text = fragments.join('')
      expect(text).to.deep.equal(fluffy_puff_html + fluffy_puff_html)
      done()
    })
  })
})

function pet_stream () {
  return h([
    {name: 'Fluffy Puff', type: 'Rabbit', age: 3},
    {name: 'Fluffy Puff', type: 'Rabbit', age: 3}
  ])
}
