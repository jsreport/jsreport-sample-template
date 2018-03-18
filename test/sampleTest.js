const samples = require('../')
const templates = require('jsreport-templates')
const xlsx = require('jsreport-xlsx')
const data = require('jsreport-data')
const scripts = require('jsreport-scripts')
const assets = require('jsreport-assets')
const handlebars = require('jsreport-handlebars')
const chromePdf = require('jsreport-chrome-pdf')
const jsreport = require('jsreport-core')
const Promise = require('bluebird')

describe('sample', function () {
  let reporter

  beforeEach(function () {
    reporter = jsreport()
    reporter.use(templates())
    reporter.use(data())
    reporter.use(xlsx())
    reporter.use(scripts({allowedModules: '*'}))
    reporter.use(assets())
    reporter.use(handlebars())
    reporter.use(chromePdf({
      launchOptions: {
        args: ['--no-sandbox']
      }
    }))
    reporter.use(samples({createSamples: true}))

    return reporter.init()
  })

  it('should be able to render all sample templates', () => {
    const reports = ['Invoice', 'Orders', 'Population']
    return Promise.all(reports.map((t) => reporter.render({ template: { name: t } })))
  })
})
