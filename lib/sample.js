/*!
 * Copyright(c) 2017 Jan Blaha
 *
 * Sample report used in standard and multitenant version
 */

var path = require('path')
var fs = require('fs')
var Promise = require('bluebird')
var readFileAsync = Promise.promisify(fs.readFile)

var resources = {
  'data.js': null,
  'helpers.js': null,
  'sample.html': null,
  'script.js': null
}

module.exports = function (reporter, definition) {
  if (reporter.compilation) {
    Object.keys(resources).forEach(function (r) {
      reporter.compilation.resource('sample-' + r, path.join(__dirname, 'sample', r))
    })
  }

  reporter.initializeListeners.add(definition.name, this, function () {
    return reporter.settings.findValue('sample-created').then(function (v) {
      if (v === true) {
        return
      }

      return Promise.all(Object.keys(resources).map(function (r) {
        var res = reporter.execution ? Promise.resolve(reporter.execution.resource('sample-' + r)) : readFileAsync(path.join(__dirname, 'sample', r))
        return res.then(function (v) {
          resources[r] = v.toString('utf8')
        })
      })).then(function () {
        var dataObj = {
          name: 'Sample data',
          dataJson: resources['data.js']
        }

        var scriptObj = {
          name: 'Sample script',
          content: resources['script.js']
        }

        var templateObj = {
          name: 'Sample report',
          content: resources['sample.html'],
          helpers: resources['helpers.js'],
          engine: 'handlebars',
          recipe: 'phantom-pdf',
          phantom: {
            header: "<h1 style='background-color:lightGray'>Library monthly report</h1> ",
            footer: 'Generated on {{generatedOn}}'
          }
        }

        return reporter.settings.addOrSet('sample-created', true).then(function () {
          return reporter.documentStore.collection('data').insert(dataObj).then(function () {
            return reporter.documentStore.collection('scripts').insert(scriptObj).then(function () {
              templateObj.data = {
                shortid: dataObj.shortid
              }
              templateObj.scripts = [{ shortid: scriptObj.shortid }]

              return reporter.documentStore.collection('templates').insert(templateObj)
            })
          })
        }).catch(function (e) {
        })
      })
    })
  })
}
