import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'

import { app as rawApp, dialog } from 'electron'

const log = getLogger('main/deltachat/settings')

import SplitOut from './splitout'
import { ExtendedAppMainProcess } from '../types'
import { DesktopSettings } from '../../shared/shared-types'
import { ensureDir, emptyDir } from 'fs-extra'
import { join, extname } from 'path'
import { getConfigPath } from '../application-constants'
import { copyFile } from 'fs'

const app = rawApp as ExtendedAppMainProcess

const serverFlagMap: { [key: string]: number } = {
  mail_security_ssl: C.DC_LP_IMAP_SOCKET_SSL,
  mail_security_starttls: C.DC_LP_IMAP_SOCKET_STARTTLS,
  mail_security_plain: C.DC_LP_IMAP_SOCKET_PLAIN,
  send_security_ssl: C.DC_LP_SMTP_SOCKET_SSL,
  send_security_starttls: C.DC_LP_SMTP_SOCKET_STARTTLS,
  send_security_plain: C.DC_LP_SMTP_SOCKET_PLAIN,
}

export default class DCSettings extends SplitOut {
  setConfig(key: string, value: string): boolean {
    log.info(`Setting config ${key}:${value}`)
    const result = this._dc.setConfig(key, String(value)) === 1

    if (
      (key === 'inbox_watch' ||
        key === 'sentbox_watch' ||
        key === 'mvbox_watch') &&
      this._dc.isIORunning()
    ) {
      log.info(`It's a watch config, restarting IO...`)
      this._dc.stopIO()
      this._dc.startIO()
    }

    return result
  }

  getConfig(key: string) {
    return this._dc.getConfig(key)
  }

  getConfigFor(keys: string[]) {
    const config: { [key: string]: string } = {}
    for (const key of keys) {
      if (key.indexOf('_security') > -1) {
        config[key] = this._convertServerFlag(
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

  setDesktopSetting(key: keyof DesktopSettings, value: string) {
    const { saved } = app.state
    ;(saved as any)[key] = value
    app.saveState({ saved })
    return true
  }

  getDesktopSettings(): DesktopSettings {
    return app.state.saved
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
  _convertServerFlag(flags: number, configKey: string) {
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

  serverFlags(props: any) {
    return serverFlags(props)
  }

  selectBackgroundImage(file: string) {
    return new Promise(async (resolve, reject) => {
      const copyAndSetBg = async (originalfile: string) => {
        await ensureDir(join(getConfigPath(), 'background/'))
        await emptyDir(join(getConfigPath(), 'background/'))
        const newPath = join(
          getConfigPath(),
          'background/',
          `background_${Date.now()}` + extname(originalfile)
        )
        copyFile(originalfile, newPath, (err: Error) => {
          if (err) {
            log.error('BG-IMG Copy Failed', err)
            reject(err)
            return
          }
          const url = `url("${newPath.replace(/\\/g, '/')}")`
          resolve(url)
        })
      }

      if (!file) {
        dialog.showOpenDialog(
          undefined,
          {
            title: 'Select Background Image',
            filters: [
              { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
              { name: 'All Files', extensions: ['*'] },
            ],
            properties: ['openFile'],
          },
          (filenames: string[]) => {
            if (!filenames) {
              return
            }
            log.info('BG-IMG Selected File:', filenames[0])
            copyAndSetBg(filenames[0])
          }
        )
      } else {
        const filepath = join(__dirname, '../../../images/backgrounds/', file)
        copyAndSetBg(filepath)
      }
    })
  }
}

export function serverFlags({
  mail_security,
  send_security,
}: {
  mail_security?: string
  send_security?: string
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
