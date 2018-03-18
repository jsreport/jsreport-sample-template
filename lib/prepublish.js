process.env.debug = 'jsreport'

const jsreport = require('jsreport-core')
const Promise = require('bluebird')
const path = require('path')
const omit = require('lodash.omit')
const writeFileAsync = Promise.promisify(require('fs').writeFile)

const helpers = require('jsreport-import-export/lib/helpers.js')

const templates = require('jsreport-templates')
const xlsx = require('jsreport-xlsx')
const data = require('jsreport-data')
const scripts = require('jsreport-scripts')
const assets = require('jsreport-assets')
const handlebars = require('jsreport-handlebars')
const chromePdf = require('jsreport-chrome-pdf')
const fsStore = require('jsreport-fs-store')

const reporter = jsreport({connectionString: { name: 'fs' }})

reporter.use(templates())
reporter.use(data())
reporter.use(xlsx())
reporter.use(scripts({allowedModules: '*'}))
reporter.use(assets())
reporter.use(handlebars())
reporter.use(chromePdf())
reporter.use(fsStore({dataDirectory: path.join(__dirname, '../samples')}))

const entitySets = ['data', 'templates', 'assets', 'scripts', 'xlsxTemplates']

async function run () {
  try {
    await reporter.init()
    const results = await Promise.all(entitySets.map((es) => {
      return reporter.documentStore.collection(es).find({})
    }))

    const allInOne = {}
    for (var i = 0; i < results.length; i++) {
      console.log(entitySets[i] + ':' + results[i].length)
      allInOne[entitySets[i]] = results[i].map((e) => omit(e, ['_id', 'modificationDate', 'creationDate']))
      helpers.bufferToBase64(reporter.documentStore.model, entitySets[i], allInOne[entitySets[i]])
    }

    await writeFileAsync('samples.json', JSON.stringify(allInOne))
    console.log('entities saved into samples.json')
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
