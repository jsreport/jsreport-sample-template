
exports.resources = [
  'data.js',
  'template.html',
  'template.xlsx'
]

exports.configuration = {
  'template.html': {
    recipe: 'xlsx',
    data: 'data.js',
    xlsxTemplate: 'template.xlsx'
  }
}
