# Rheo

![Godess Rhea](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Rh%C3%A9a_pr%C3%A9sentant_une_pierre_emmaillot%C3%A9e_%C3%A0_Cronos_dessin_du_bas-relief_d%27un_autel_romain.jpg/240px-Rh%C3%A9a_pr%C3%A9sentant_une_pierre_emmaillot%C3%A9e_%C3%A0_Cronos_dessin_du_bas-relief_d%27un_autel_romain.jpg)

Rheo is a template library built on top of `html-tokenize` and `html-select`
it is heavily inspired by `hyperstream` and `hyperspace`.

# Usage

Rheo uses streams everywhere, and where it can't use streams it uses callbacks
that recieves and returns streams, with few exceptions.

## Simple example
The simplest and not very interesting you can do is to just parse and then
render html, like so:

```js
rheo('<h1>Hello Rheo!</h1>').render().pipe(req)

\\ or

html_stream,pipe(rheo()).render().pipe(req)
```

## Using CSS selectors

That was not really exciting, right? Let's do something more fun and change
the message from the last "exercise".

```js
html_stream,pipe(rheo())
  .replace.inner('h1', function (inner_template) {
    return rheo('Hello Template')
  })
  .render()
  .pipe(req)
```

or the short hand:

```js
html_stream,pipe(rheo())
  .replace.inner('h1', rheo('Hello Template'))
  .render()
  .pipe(req)
```

Replace and replace.inner both return a new rheo stream and you could chain
multiple of these calls and shape your template.

## Changing attributes

A lot of the things that happen in a webpage are defined by attributes. This
is the only place where the stream/callback pattern breaks in Rheo. But don't
worry it's still not complicated. And in theory we are only a pull request away from
unifying the interface.


```js
html_stream,pipe(rheo())
  .replace.attribute('h1', 'class', function (old_value) {
    return old_value + ' rainbow'
  })
  .render()
  .pipe(req)
```

Or shorthand if there is no other classes.

```js
html_stream,pipe(rheo())
  .replace.attribute('h1', 'class', 'rainbow')
  .render()
  .pipe(req)
```

A little rainbow in your headings could never hurt, could it?


If you would like to change multiple attributes on the same element there is a
shorthand for that to.

```js
html_stream,pipe(rheo())
  .replace.attributes('a', {
    'class': 'rainbow',
    'href': '#rainbow_power'
  })
  .render()
  .pipe(req)
```


## Design by Example

Sometimes hardcoded is just plain better then handcrafting a machinery that
does the same thing. Therefore its easy to pick one of many options when
replacing a content with one of its elements.

```html
<div class="fortune">
  <span class="fortune-good">Your code will read like well writen prose.</span>
  <span class="fortune-bad">You will be stuck in the debugger all day.</span>
</div>
```

```js
html_stream,pipe(rheo())
  .replace.inner('fortune', function (fortunes) {
    return fortunes.find('.fortuen-good')
  })
  .render()
  .pipe(req)

```

## Iteration, map

HTML is a tree structure writen in a serial format. Sooner or later we want
map some stream of data into a stream of html.

Take a look at this *view controller*.

```js
function render_pet(template, data) {
  return template
    .replace.inner('pet-name', function () {return rheo(data.name)})
    .replace.inner('pet-age', function () {return rheo(data.age.toString())})
    .replace.inner('pet-type', function () {return rheo(data.type)})
}
```

This function binds data to one pet template. This could be used for a pet
profile, with the correct HTML. But it can also be reused for building list of
pets.

It works fine now to render one, but how do we render all list items?

```js
html_stream,pipe(rheo())
  .replace.inner('.pet-list', function (pet_template) {
    var pet_template_stream = pet_template.map(render_pet)
    return pet_data_stream.pipe(pet_template_stream)
  })
  .render()
  .pipe(req)
```

Assuming that `pet_data_stream` is a stream of pet data objects and that
`html_stream` is a text stream of html with a list with the class `pet-list`
and that that list contains one example of a pet list item, then this will
render a list of pets in that list.

## Super Modularity

As you can see there is enormus potential to decouple your layout and templating
from logic. And that is both good and dangerous so please be careful! But one 
more neat trick needs to be shared.

How many times have a templating librarie let you down when doing something as
trivial as setting the `title` of your page. I have seen realy nasty ways to
deal with that and selecting the current page in a menu.

Changing things that have already been renderd in a `layout` template is
normaly frustrating and hackish. With Rheo? No, it's simple!


Rheo templates can be piped together like so:

```js
function select_menu(menu_name) {
  var selector = '.menu .menu-item.' + menu_name
  return rheo.chain(function (stream) {
    return stream
      .replace.attribute(selector, 'class', function (classes) {
        return classes + ' selected'
      })
      .replace.attribute(selector + ' a', 'href', function () {
        return '#'
      })
  })
}

function set_title(title) {
  return rheo.chain()
    .replace.inner('title', function () {return rheo(title)})
}

page_template
  .pipe(select_menu('profile'))
  .pipe(set_title('My fluffy dog'))
  .render()
  .pipe(req)
```

As long as the element with the selector that you want to alter is put into the
stream it doesn't matter when you add the menu or change the title, except for
performence. Neat huh!?



## Advanced example

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
  })
  .render()
  .pipe(process.stdout)
```
