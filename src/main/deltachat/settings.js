const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/settings')

function setConfig (key, value) {
  log.info(`Setting config ${key}:${value}`)
  return this._dc.setConfig(key, String(value))
}

function getConfig (key) {
  console.log('getConfig', key)
  return this._dc.getConfig(key)
}

function getConfigFor (keys) {
  console.log('getConfigFor', keys)
  const config = {}
  for (const key of keys) {
    config[key] = this.getConfig(key)
  }
  return config
}

function keysImport (directory) {
  this._dc.importExport(C.DC_IMEX_IMPORT_SELF_KEYS, directory)
}

function keysExport (directory) {
  this._dc.importExport(C.DC_IMEX_EXPORT_SELF_KEYS, directory)
}

module.exports = function () {
  this.setConfig = setConfig.bind(this)
  this.getConfig = getConfig.bind(this)
  this.getConfigFor = getConfigFor.bind(this)
  this.keysImport = keysImport.bind(this)
  this.keysExport = keysExport.bind(this)
}
