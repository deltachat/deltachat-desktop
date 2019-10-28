const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/settings', true)

const SplitOut = require('./splitout')

const serverFlagMap = {
  mail_security_ssl: C.DC_LP_IMAP_SOCKET_SSL,
  mail_security_starttls: C.DC_LP_IMAP_SOCKET_STARTTLS,
  mail_security_plain: C.DC_LP_IMAP_SOCKET_PLAIN,
  send_security_ssl: C.DC_LP_SMTP_SOCKET_SSL,
  send_security_starttls: C.DC_LP_SMTP_SOCKET_STARTTLS,
  send_security_plain: C.DC_LP_SMTP_SOCKET_PLAIN
}

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
      if (key.indexOf('_security') > -1) {
        config[key] = this.convertServerFlag(this.getConfig('configured_server_flags'), key)
      } else {
        config[key] = this.getConfig(key)
      }
    }
    return config
  }

  keysImport (directory) {
    this._dc.importExport(C.DC_IMEX_IMPORT_SELF_KEYS, directory)
  }

  keysExport (directory) {
    this._dc.importExport(C.DC_IMEX_EXPORT_SELF_KEYS, directory)
  }

  updateConfigs (newValues) {
    Object.keys(newValues).map(
      (key) => {
        if (key === 'send_security' || key === 'mail_security') {

        } else {
          this.setConfig(key, newValues[key])
        }
      }
    )
  }

  convertServerFlag (flags, configKey) {
    configKey = configKey.replace('configured_', '')
    let result = 'automatic'
    Object.keys(serverFlagMap).map(
      (key) => {
        if (flags & serverFlagMap[key]) {
          if (key.indexOf(configKey) === 0) {
            result = key.replace(configKey + '_', '')
          }
        }
      }
    )
    return result
  }

  /* eslint-disable camelcase */
  serverFlags ({ mail_security, send_security }) {
    const flags = []

    if (mail_security !== '') {
      flags.push(serverFlagMap['mail_security_' + mail_security])
    }

    if (send_security !== '') {
      flags.push(serverFlagMap['send_security_' + send_security])
    }

    return flags.reduce((flag, acc) => {
      return acc | flag
    }, 0)
  }
}
