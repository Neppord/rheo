var fs = require('fs')
var rheo = require('./')
function file () {
  return fs.createReadStream('test_data/speed.html')
}

var min = Infinity
function bench () {
  var start = process.hrtime()
  file()
    .pipe(rheo())
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .replace('img', rheo(''))
    .render()
    .on('data', function () {})
    .on('error', function (error) {console.log(error)})
    .on('end', function () {
      var arr = process.hrtime(start)
      var diff = arr[1] + arr[0] * 1e9
      min = Math.min(diff, min)
      console.log('current: ' + (diff / 1e9) + ' ms')
      console.log('min:     ' + (min / 1e9) + ' ms')
      bench()
    })
}

bench()
