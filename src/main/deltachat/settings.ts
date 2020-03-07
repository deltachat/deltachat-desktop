import { C } from 'deltachat-node'
import logModule from '../../shared/logger'

const log = logModule.getLogger('main/deltachat/settings')

import SplitOut from './splitout'

const serverFlagMap: { [key: string]: number } = {
  mail_security_ssl: C.DC_LP_IMAP_SOCKET_SSL,
  mail_security_starttls: C.DC_LP_IMAP_SOCKET_STARTTLS,
  mail_security_plain: C.DC_LP_IMAP_SOCKET_PLAIN,
  send_security_ssl: C.DC_LP_SMTP_SOCKET_SSL,
  send_security_starttls: C.DC_LP_SMTP_SOCKET_STARTTLS,
  send_security_plain: C.DC_LP_SMTP_SOCKET_PLAIN,
}

export default class DCSettings extends SplitOut {
  setConfig(key: string, value: string) {
    log.info(`Setting config ${key}:${value}`)
    return this._dc.setConfig(key, String(value))
  }

  getConfig(key: string) {
    return this._dc.getConfig(key)
  }

  getConfigFor(keys: string[]) {
    const config: { [key: string]: string } = {}
    for (const key of keys) {
      if (key.indexOf('_security') > -1) {
        config[key] = this.convertServerFlag(
          Number(this.getConfig('server_flags')),
          key
        )
      } else if (key.indexOf('_port') > -1) {
        config[key] = this.getConfig(key) === '0' ? '' : this.getConfig(key)
      } else {
        config[key] = this.getConfig(key)
      }
    }
    return config
  }

  keysImport(directory: string) {
    this._dc.importExport(C.DC_IMEX_IMPORT_SELF_KEYS, directory, undefined)
  }

  keysExport(directory: string) {
    this._dc.importExport(C.DC_IMEX_EXPORT_SELF_KEYS, directory, undefined)
  }

  /**
   *
   * get a string value from bitmask (automatic, ssl, starttls or plain)
   *
   * @param flags bitmask
   * @param configKey string
   */
  convertServerFlag(flags: number, configKey: string) {
    configKey = configKey.replace('configured_', '')
    let result = 'automatic'
    Object.keys(serverFlagMap).map(key => {
      if (flags & serverFlagMap[key]) {
        if (key.indexOf(configKey) === 0) {
          result = key.replace(configKey + '_', '')
        }
      }
    })
    return result
  }

  /* eslint-disable camelcase */
  serverFlags({
    mail_security,
    send_security,
  }: {
    mail_security: string
    send_security: string
  }) {
    const flags = []
    if (mail_security === '' && send_security === '') {
      return ''
    }
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
