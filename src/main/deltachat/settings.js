function checkPassword (password) {
  return password === this.getConfig('mail_pw')
}

function keysImport (directory) {
  this._dc.importExport(C.DC_IMEX_IMPORT_SELF_KEYS, directory)
}

function keysExport (directory) {
  this._dc.importExport(C.DC_IMEX_EXPORT_SELF_KEYS, directory)
}

function backupExport (dir) {
  this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
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

// Save settings for RC
function updateSettings (saved) {
  this._saved = saved
}

module.exports = function() {
  this.checkPassword = checkPassword.bind(this)
  this.keysImport = keysImport.bind(this)
  this.keysExport = keysExport.bind(this)
  this.backupExport = backupExport.bind(this)
  this.setConfig = setConfig.bind(this)
  this.getConfig = getConfig.bind(this)
  this.updateSettings = updateSettings.bind(this)
}
