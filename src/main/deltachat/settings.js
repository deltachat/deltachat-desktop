const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/settings', true)

const SplitOut = require('./splitout')
module.exports = class DCSettings extends SplitOut {
  setConfig (key, value) {
    log.info(`Setting config ${key}:${value}`)
    return this._dc.setConfig(key, String(value))
  }

  getConfig (key) {
    return this._dc.getConfig(key)
  }

  getConfigFor (keys) {
    const config = {}
    for (const key of keys) {
      config[key] = this.getConfig(key)
    }
    return config
  }

  keysImport (directory) {
    this._dc.importExport(C.DC_IMEX_IMPORT_SELF_KEYS, directory)
  }

  keysExport (directory) {
    this._dc.importExport(C.DC_IMEX_EXPORT_SELF_KEYS, directory)
  }
}
