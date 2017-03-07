var samples = require('../')
var templates = require('jsreport-templates')
var xlsx = require('jsreport-xlsx')
var data = require('jsreport-data')
var scripts = require('jsreport-scripts')
var assets = require('jsreport-assets')
var handlebars = require('jsreport-handlebars')
var phantomPdf = require('jsreport-phantom-pdf')
var jsreport = require('jsreport-core')
var Promise = require('bluebird')

describe('sample', function () {
  var reporter

  beforeEach(function () {
    reporter = jsreport()
    reporter.use(templates())
    reporter.use(data())
    reporter.use(xlsx())
    reporter.use(scripts({allowedModules: '*'}))
    reporter.use(assets())
    reporter.use(handlebars())
    reporter.use(phantomPdf())
    reporter.use(samples({allExamples: true}))

    return reporter.init()
  })

  it('should be able to render all sample templates', function () {
    var reports = ['Excel Chart report', 'Sample report', 'Orders report']
    return Promise.all(reports.map(function (t) {
      return reporter.render({ template: { name: t } })
    }))
  })
})
