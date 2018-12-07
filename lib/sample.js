/*!
 * Copyright(c) 2018 Jan Blaha
 *
 * Sample report used in standard and multitenant version
 */

const path = require('path')
const util = require('util')
const fs = require('fs')
const omit = require('lodash.omit')
const readFileAsync = util.promisify(fs.readFile)
const pathToSamples = path.join(__dirname, '../samples.json')

module.exports = function (reporter, definition) {
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

    const found = await reporter.documentStore.collection('folders').findOne({
      name: 'samples'
    })

    if (found) {
      reporter.logger.debug(`Not creating samples because "samples" folder already exists`)
      return
    }

    reporter.logger.debug(`Creating folder "samples" for sample entities`)

    const rootFolder = await reporter.documentStore.collection('folders').insert({
      name: 'samples'
    })

    for (let es of ['folders', ...Object.keys(omit(entities, 'folders'))]) {
      const collection = reporter.documentStore.collection(es)
      let entitiesToProcess

      if (!collection) {
        entitiesToProcess = []
      } else {
        entitiesToProcess = collection.convertBase64ToBufferInEntity(entities[es])
      }

      for (const entity of entitiesToProcess) {
        const parentFolder = es === 'folders' ? { shortid: rootFolder.shortid } : entity.folder

        const previousEntity = await reporter.documentStore.collection(es).findOne({
          name: entity.name,
          folder: parentFolder
        })

        if (!previousEntity) {
          reporter.logger.debug(`Inserting sample entity ${entity.name} (entitySet: ${es})`)
          await reporter.documentStore.collection(es).insert({ ...entity, folder: parentFolder })
        }
      }
    }
  })
}
