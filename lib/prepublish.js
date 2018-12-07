process.env.debug = 'jsreport'

const jsreport = require('jsreport-core')
const util = require('util')
const path = require('path')
const omit = require('lodash.omit')
const writeFileAsync = util.promisify(require('fs').writeFile)

const templates = require('jsreport-templates')
const xlsx = require('jsreport-xlsx')
const data = require('jsreport-data')
const pdfUtils = require('jsreport-pdf-utils')
const scripts = require('jsreport-scripts')
const assets = require('jsreport-assets')
const handlebars = require('jsreport-handlebars')
const chromePdf = require('jsreport-chrome-pdf')
const fsStore = require('jsreport-fs-store')

const reporter = jsreport({store: { provider: 'fs' }})

reporter.use(templates())
reporter.use(data())
reporter.use(xlsx())
reporter.use(scripts({allowedModules: '*'}))
reporter.use(assets())
reporter.use(pdfUtils())
reporter.use(handlebars())
reporter.use(chromePdf())
reporter.use(fsStore({dataDirectory: path.join(__dirname, '../samples')}))

const entitySets = ['folders', 'data', 'templates', 'assets', 'scripts', 'xlsxTemplates']

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
      allInOne[entitySets[i]] = reporter.documentStore.collection(entitySets[i]).convertBufferToBase64InEntity(allInOne[entitySets[i]])
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
