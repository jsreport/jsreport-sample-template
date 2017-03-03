
exports.resources = [
  'data.js',
  'helpers.js',
  'sample.html',
  'sample-header.html',
  'sample-footer.html',
  'script.js'
]

exports.associations = {
  'sample.html': {
    data: 'data.js',
    scripts: ['script.js']
  }
}
