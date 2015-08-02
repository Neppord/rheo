/* global it describe */
var expect = require('chai').expect
var verify = require('./')
var parse = require('../parse')
describe('verify', function () {
  it('throws a error when a tag closes befor its children', function (done) {
    var error_appened = false
    var tokens = parse()
    tokens.end('<li><div></li></div>')
    tokens
      .pipe(verify())
      .on('error', function (err) {
        expect(err.message).to.contain('li')
        expect(err.message).to.contain('div')
        error_appened = true
      })
      .on('end', function () {
        if (error_appened) done()
        else done(new Error('No error thrown'))
      })
      .on('data', function () {})
  })
})
