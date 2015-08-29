var cssauron = require('cssauron')
module.exports = cssauron({
  tag: 'name',
  attr: function (node, attr) {return node.attrs[attr]},
  'class': function (node) {return node.attrs['class']}
})
