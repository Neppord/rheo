var cssauron = require('cssauron')
module.exports = cssauron({
  'tag': 'name',
  'id': function (node) { return get_attr(node, 'id')},
  'class': function (node) { return get_attr(node, 'class')},
  'attr': get_attr,
  'parent': 'parent',
  'children': function (node) {return node && node.children && node.children.toArray() || [] }
})

function get_attr (node, attr) {
  return node && node.attrs && node.attrs[attr]
}
