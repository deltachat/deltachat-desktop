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
      if (key.indexOf('_port') > -1) {
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

  estimateAutodeleteCount(fromServer: boolean, seconds: number) {
    return this._dc.estimateDeletionCount(fromServer, seconds)
  }
}

