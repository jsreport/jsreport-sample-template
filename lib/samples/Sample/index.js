
exports.resources = [
  'data.js',
  'helpers.js',
  'template.html',
  'template.header.html',
  'template.footer.html',
  'script.js'
]

exports.associations = {
  'template.html': {
    data: 'data.js',
    scripts: ['script.js']
  }
}
