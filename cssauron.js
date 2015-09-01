var cssauron = require('cssauron')
module.exports = cssauron({
  tag: 'name',
  'id': function (node) {return node && node.attrs['id'] || ''},
  attr: function (node, attr) {return node && node.attrs[attr] || ''},
  'class': function (node) {return node && node.attrs['class'] || ''},
  'parent': 'parent',
  children: function (node) {return node && node.children.toArray() || [] }
})
