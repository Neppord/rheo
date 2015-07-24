#Rheo

Rheo is a template library built on top of `html-tokenize` and `html-select`
it is hevily inspierd by `hyperstream` and `hyperspace`.

#Usage

```html
<html>
  <head></head>
  <body>
    <h1>Todo</h1>
    <ul class="things">
      <li class="done">
        <img src="smily.png">
        <span class="title"></span>
      </li>
      <li class="pending">
        <img src="sadface.png">
        <span class="title"></span>
      </li>
    </uĺ>
  </body>
<html>
```

```js
var rheo = require('rheo')
html_stream.pipe(rheo())
  .replace.inner('.things', function (items) {
    var item_template_stream = items.map(function (template, data) {
      return template
        .find(data.done? ".done": ".pending") 
        .replace.inner(".title", function () {
          return rheo(data,title)
        })
    })
    return item_stream.pipe(item_template_stream)
  }).render().pipe(process.stdout)
```
