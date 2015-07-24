#Rheo

Rheo is a template library built on top of `html-tokenize` and `html-select`
it is hevily inspierd by `hyperstream` and `hyperspace`.

#Usage

```js
var rheo = require('rheo')
rheo.parse('<html><head></head><body><h1 class="greeting"></h1></body><html>')
  .replace.inner('.greeting', function () {
    return rheo.parse('Welcome to my Homepage') 
  }).pipe(process.stdout)
```
