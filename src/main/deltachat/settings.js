const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/settings')

// Save settings for RC
function updateSettings (saved) {
  this._saved = saved
}

function setConfig (key, value) {
  log.info(`Setting config ${key}:${value}`)
  return this._dc.setConfig(key, String(value))
}

function getConfig (key) {
  return this._dc.getConfig(key)
}

function getConfigFor (keys) {
  let config = {}
  for (let key of keys) {
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
  this.updateSettings = updateSettings.bind(this)
  this.setConfig = setConfig.bind(this)
  this.getConfig = getConfig.bind(this)
  this.getConfigFor = getConfigFor.bind(this)
  this.keysImport = keysImport.bind(this)
  this.keysExport = keysExport.bind(this)
}
