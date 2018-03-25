/*!
 * Copyright(c) 2018 Jan Blaha
 *
 * Sample report used in standard and multitenant version
 */

const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const readFileAsync = Promise.promisify(fs.readFile)
const pathToSamples = path.join(__dirname, '../samples.json')
const helpers = require('jsreport-import-export/lib/helpers.js')

module.exports = function (reporter, definition) {
  definition.options = definition.options || { allExamples: true }

  if (reporter.compilation) {
    reporter.compilation.resourceInTemp('samples.json', pathToSamples)
  }

  if (!definition.options.createSamples) {
    reporter.logger.debug('Creating samples is disabled')
    return
  }

  reporter.initializeListeners.add(definition.name, this, async () => {
    if (reporter.compilation) {
      reporter.logger.debug('Skipping creation of samples because we are in compilation mode..')
      return
    }

    const isAlreadyCreated = await reporter.settings.findValue('sample-created')
    if (isAlreadyCreated === true && !definition.options.forceCreation) {
      return
    }

    reporter.logger.debug('Inserting samples')

    await reporter.settings.addOrSet('sample-created', true)
    const pathToResource = reporter.execution ? reporter.execution.resourceTempPath('samples.json') : pathToSamples

    const res = await readFileAsync(pathToResource)
    const entities = JSON.parse(res)

    for (let es in entities) {
      helpers.base64ToBuffer(reporter.documentStore.model, es, entities[es])

      for (const entity of entities[es]) {
        const template = await reporter.documentStore.collection(es).findOne({name: entity.name})
        if (!template) {
          reporter.logger.debug('Inserting sample entity ' + entity.name)
          await reporter.documentStore.collection(es).insert(entity)
        }
      }
    }
  })
}
