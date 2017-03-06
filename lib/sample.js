/*!
 * Copyright(c) 2017 Jan Blaha
 *
 * Sample report used in standard and multitenant version
 */

var path = require('path')
var fs = require('fs')
var omit = require('lodash.omit')
var Promise = require('bluebird')
var readFileAsync = Promise.promisify(fs.readFile)

var pathToSamples = path.join(__dirname, 'samples')

var samples = {
  Sample: require('./samples/Sample'),
  Unbreakable: require('./samples/Unbreakable'),
  'Excel Chart': require('./samples/Excel Chart')
}

var resources = {}

module.exports = function (reporter, definition) {
  definition.options = definition.options || { allExamples: true }

  if (reporter.compilation) {
    Object.keys(samples).forEach(function (s) {
      samples[s].resources.forEach(function (r) {
        reporter.compilation.resource(s + '-' + r, path.join(pathToSamples, s, r))
      })
    })
  }

  reporter.initializeListeners.add(definition.name, this, function () {
    return reporter.settings.findValue('sample-created').then(function (v) {
      if (v === true && !definition.options.forceCreation) {
        return
      }

      if (!definition.options.allExamples) {
        return
      }

      return Promise.all(Object.keys(samples).map(function (s) {
        var sample = samples[s]

        return Promise.map(sample.resources, function (r) {
          var res = reporter.execution ? Promise.resolve(reporter.execution.resource(s + '-' + r)) : readFileAsync(path.join(pathToSamples, s, r))

          return res.then(function (rawContent) {
            var resourceExtension = path.extname(r)
            var content

            if (resourceExtension === '.xlsx') {
              content = rawContent.toString('base64')
            } else {
              content = rawContent.toString('utf8')
            }

            return {
              from: s,
              name: r,
              content: content
            }
          })
        }).each(function (resource) {
          if (!resources[resource.from]) {
            resources[resource.from] = {}
          }

          resources[resource.from][resource.name] = {
            name: resource.name,
            content: resource.content.toString('utf8'),
            configuration: sample.configuration[resource.name] || undefined
          }
        })
      })).then(function () {
        var resourcesToCreate = {
          data: [],
          script: [],
          xlsxTemplate: [],
          template: []
        }

        Object.keys(resources).forEach(function (sampleName) {
          var sampleResources = resources[sampleName]

          if (sampleResources['data.js']) {
            resourcesToCreate.data.push({
              name: sampleName + ' data',
              dataJson: sampleResources['data.js'].content,
              sampleName: sampleName,
              originalName: sampleResources['data.js'].name
            })
          }

          if (sampleResources['script.js']) {
            resourcesToCreate.script.push({
              name: sampleName + ' script',
              content: sampleResources['script.js'].content,
              sampleName: sampleName,
              originalName: sampleResources['script.js'].name
            })
          }

          if (sampleResources['template.xlsx']) {
            resourcesToCreate.xlsxTemplate.push({
              name: sampleName + ' xlsx',
              contentRaw: sampleResources['template.xlsx'].content,
              sampleName: sampleName,
              originalName: sampleResources['template.xlsx'].name
            })
          }

          if (sampleResources['template.html']) {
            resourcesToCreate.template.push({
              name: sampleName + ' report',
              content: sampleResources['template.html'].content,
              helpers: sampleResources['helpers.js'] ? sampleResources['helpers.js'].content : undefined,
              engine: 'handlebars',
              recipe: 'phantom-pdf',
              phantom: {
                header: sampleResources['template.header.html'] ? sampleResources['template.header.html'].content : undefined,
                footer: sampleResources['template.footer.html'] ? sampleResources['template.footer.html'].content : undefined
              },
              sampleName: sampleName,
              originalName: sampleResources['template.html'].name
            })
          }
        })

        return reporter.settings.addOrSet('sample-created', true).then(function () {
          var insertDataAsync = Promise.each(resourcesToCreate.data, function (dataItem) {
            return reporter.documentStore.collection('data').insert(omit(dataItem, ['sampleName', 'originalName'])).then(function (item) {
              resources[dataItem.sampleName][dataItem.originalName].shortid = item.shortid
            })
          })

          var insertScriptsAsync = Promise.each(resourcesToCreate.script, function (scriptItem) {
            return reporter.documentStore.collection('scripts').insert(omit(scriptItem, ['sampleName', 'originalName'])).then(function (item) {
              resources[scriptItem.sampleName][scriptItem.originalName].shortid = item.shortid
            })
          })

          var insertXlsxTemplatesAsync = Promise.each(resourcesToCreate.xlsxTemplate, function (xlsxItem) {
            return reporter.documentStore.collection('xlsxTemplates').insert(omit(xlsxItem, ['sampleName', 'originalName'])).then(function (item) {
              resources[xlsxItem.sampleName][xlsxItem.originalName].shortid = item.shortid
            })
          })

          return Promise.all([
            insertDataAsync,
            insertScriptsAsync,
            insertXlsxTemplatesAsync
          ]).then(function () {
            return Promise.each(resourcesToCreate.template, function (templateItem) {
              if (resources[templateItem.sampleName][templateItem.originalName].configuration) {
                if (resources[templateItem.sampleName][templateItem.originalName].configuration.engine) {
                  templateItem.engine = resources[templateItem.sampleName][templateItem.originalName].configuration.engine
                }

                if (resources[templateItem.sampleName][templateItem.originalName].configuration.recipe) {
                  templateItem.recipe = resources[templateItem.sampleName][templateItem.originalName].configuration.recipe
                }

                if (
                  resources[templateItem.sampleName][templateItem.originalName].configuration.data &&
                  resources[templateItem.sampleName][resources[templateItem.sampleName][templateItem.originalName].configuration.data]
                ) {
                  templateItem.data = {
                    shortid: resources[templateItem.sampleName][resources[templateItem.sampleName][templateItem.originalName].configuration.data].shortid
                  }
                }

                if (
                  resources[templateItem.sampleName][templateItem.originalName].configuration.xlsxTemplate &&
                  resources[templateItem.sampleName][resources[templateItem.sampleName][templateItem.originalName].configuration.xlsxTemplate]
                ) {
                  templateItem.xlsxTemplate = {
                    shortid: resources[templateItem.sampleName][resources[templateItem.sampleName][templateItem.originalName].configuration.xlsxTemplate].shortid
                  }
                }

                if (Array.isArray(resources[templateItem.sampleName][templateItem.originalName].configuration.scripts)) {
                  templateItem.scripts = resources[templateItem.sampleName][templateItem.originalName].configuration.scripts.map(function (script) {
                    if (!resources[templateItem.sampleName][script]) {
                      return
                    }

                    return {
                      shortid: resources[templateItem.sampleName][script].shortid
                    }
                  })

                  templateItem.scripts = templateItem.scripts.filter(Boolean)
                }
              }

              return reporter.documentStore.collection('templates').insert(omit(templateItem, ['sampleName', 'originalName']))
            })
          })
        }).catch(function (e) {
        })
      })
    })
  })
}
