var fs = require('fs')
var rheo = require('./')
var h = require('highland')
function file () {
  return fs.createReadStream('test_data/speed.html')
}

var min = Infinity
function bench () {
  var start = process.hrtime()
  file()
    .pipe(rheo())
    .every_attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .attribute('img', 'src', '')
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .outer('img', rheo(''))
    .find('body')
    .find('.mw-body')
    .inner('.mv-page-base', function (t) {
      return rheo('<ul><li></li></ul>')
        .inner('ul', function (t) {
          return h([1, 2, 3, 4, 5, 6, 7, 10])
            .pipe(t.map(function (li, d) {
              return li.inner('li', rheo(d))
            }))
        })
    })
    .render()
    .on('data', function (data) {})
    .on('error', function (error) {console.log(error)})
    .once('end', function () {
      var arr = process.hrtime(start)
      var diff = arr[1] + arr[0] * 1e9
      min = Math.min(diff, min)
      console.log('current: ' + (diff / 1e9) + ' ms')
      console.log('min:     ' + (min / 1e9) + ' ms')
      bench()
    })
}

bench()
