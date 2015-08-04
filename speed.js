var fs = require('fs')
var parse = require('./parse')
var verify = require('./verify')
var tokens = fs
  .createReadStream('test_data/speed.html')
  .pipe(parse())

console.time('verify')
tokens
  .pipe(verify())
  .on('data', function () {})
  .on('end', function () {console.timeEnd('verify')})

