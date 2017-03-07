/*!
 * Copyright(c) 2017 Jan Blaha
 *
 * Sample report used in standard and multitenant version
 */

var path = require('path')
var fs = require('fs')
var Promise = require('bluebird')
var readFileAsync = Promise.promisify(fs.readFile)
var pathToSamples = path.join(__dirname, '../samples.json')

module.exports = function (reporter, definition) {
  definition.options = definition.options || { allExamples: true }

  if (reporter.compilation) {
    reporter.compilation.resourceInTemp('samples.json', pathToSamples)
  }

  reporter.initializeListeners.add(definition.name, this, function () {
    if (reporter.compilation) {
      reporter.logger.debug('Skipping creation of samples because we are in compilation mode..')
      return
    }

    return reporter.settings.findValue('sample-created').then(function (v) {
      if (v === true && !definition.options.forceCreation) {
        return
      }

      if (!definition.options.allExamples) {
        return
      }

      return reporter.settings.addOrSet('sample-created', true).then(function () {
        var pathToResource = reporter.execution ? reporter.execution.resourceTempPath('samples.json') : pathToSamples
        return readFileAsync(pathToResource).then(function (res) {
          var entities = JSON.parse(res)
          return Promise.all(Object.keys(entities).map(function (es) {
            return Promise.all(entities[es].map(function (entity) {
              return reporter.documentStore.collection(es).insert(entity)
            }))
          }))
        })
      })
    })
  })
}
