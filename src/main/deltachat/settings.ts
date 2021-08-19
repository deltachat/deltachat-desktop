import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'

import { app as rawApp } from 'electron'

const log = getLogger('main/deltachat/settings')

import SplitOut from './splitout'
import { ExtendedAppMainProcess } from '../types'
import { DesktopSettings } from '../../shared/shared-types'
import { copyFile, mkdir, rm } from 'fs/promises'
import { join, extname } from 'path'
import { getConfigPath } from '../application-constants'
import { updateTrayIcon } from '../tray'

const app = rawApp as ExtendedAppMainProcess

export default class DCSettings extends SplitOut {
  setConfig(key: string, value: string): boolean {
    log.info(`Setting config ${key}:${value}`)
    const result = this.selectedAccountContext.setConfig(key, String(value)) === 1

    if (
      key === 'inbox_watch' ||
      key === 'sentbox_watch' ||
      key === 'mvbox_watch'
    ) {
      log.info(`It's a watch config, restarting IO...`)
      this.dc.stopIO()
      this.dc.startIO()
    }

    return Boolean(result)
  }

  getConfig(key: string) {
    return this.selectedAccountContext.getConfig(key)
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

    if (key === 'minimizeToTray') updateTrayIcon()

    return true
  }

  getDesktopSettings(): DesktopSettings {
    return app.state.saved
  }

  keysImport(directory: string) {
    this.selectedAccountContext.importExport(C.DC_IMEX_IMPORT_SELF_KEYS, directory, undefined)
  }

  keysExport(directory: string) {
    this.selectedAccountContext.importExport(C.DC_IMEX_EXPORT_SELF_KEYS, directory, undefined)
  }

  async saveBackgroundImage(file: string, isDefaultPicture: boolean) {
    const originalFilePath = !isDefaultPicture
      ? file
      : join(__dirname, '../../../images/backgrounds/', file)

    const bgDir = join(getConfigPath(), 'background')
    await rm(bgDir, { recursive: true, force: true })
    await mkdir(bgDir, { recursive: true })
    const newPath = join(
      getConfigPath(),
      'background',
      `background_${Date.now()}` + extname(originalFilePath)
    )
    try {
      await copyFile(originalFilePath, newPath)
    } catch (error) {
      log.error('BG-IMG Copy Failed', error)
      throw error
    }
    return `url("${newPath.replace(/\\/g, '/')}")`
  }

  estimateAutodeleteCount(fromServer: boolean, seconds: number) {
    return this.selectedAccountContext.estimateDeletionCount(fromServer, seconds)
  }
}
