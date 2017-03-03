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
  Unbreakable: require('./samples/Unbreakable')
}

var resources = {}

module.exports = function (reporter, definition) {
  definition.options = definition.options || { allExamples: true }

  if (reporter.compilation) {
    Object.keys(samples).forEach(function (s) {
      s.resources.forEach(function (r) {
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
          var res = reporter.execution ? Promise.resolve(reporter.execution.resource(s + '-' + r)) : readFileAsync(path.join(pathToSamples, s, r), { encoding: 'utf8' })

          return res.then(function (content) {
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
            associations: sample.associations[resource.name] || undefined
          }
        })
      })).then(function () {
        var resourcesToCreate = {
          data: [],
          script: [],
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

          return Promise.all([insertDataAsync, insertScriptsAsync]).then(function () {
            return Promise.each(resourcesToCreate.template, function (templateItem) {
              if (!resources[templateItem.sampleName][templateItem.originalName].associations) {
                return
              }

              if (
                resources[templateItem.sampleName][templateItem.originalName].associations.data &&
                resources[templateItem.sampleName][resources[templateItem.sampleName][templateItem.originalName].associations.data]
              ) {
                templateItem.data = {
                  shortid: resources[templateItem.sampleName][resources[templateItem.sampleName][templateItem.originalName].associations.data].shortid
                }
              }

              if (Array.isArray(resources[templateItem.sampleName][templateItem.originalName].associations.scripts)) {
                templateItem.scripts = resources[templateItem.sampleName][templateItem.originalName].associations.scripts.map(function (script) {
                  if (!resources[templateItem.sampleName][script]) {
                    return
                  }

                  return {
                    shortid: resources[templateItem.sampleName][script].shortid
                  }
                })

                templateItem.scripts = templateItem.scripts.filter(Boolean)
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
