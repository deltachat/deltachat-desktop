import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/settings')

import SplitOut from './splitout'
import { DesktopSettingsType } from '../../shared/shared-types'
import { copyFile, mkdir, rm } from 'fs/promises'
import { join, extname } from 'path'
import { getConfigPath } from '../application-constants'
import { updateTrayIcon } from '../tray'
import { DesktopSettings } from '../desktop_settings'

export default class DCSettings extends SplitOut {
  setDesktopSetting(key: keyof DesktopSettingsType, value: string) {
    DesktopSettings.update({ [key]: value })

    if (key === 'minimizeToTray') updateTrayIcon()

    if (key === 'syncAllAccounts') {
      if (value) {
        this.accounts.startIO()
      } else {
        this.accounts.stopIO()
      }
    }

    return true
  }

  getDesktopSettings(): DesktopSettingsType {
    return DesktopSettings.state
  }

  async saveBackgroundImage(file: string, isDefaultPicture: boolean) {
    const originalFilePath = !isDefaultPicture
      ? file
      : join(__dirname, '../../../images/backgrounds/', file)

    const bgDir = join(getConfigPath(), 'background')
    await rm(bgDir, { recursive: true, force: true })
    await mkdir(bgDir, { recursive: true })
    const fileName = `background_${Date.now()}` + extname(originalFilePath)
    const newPath = join(getConfigPath(), 'background', fileName)
    try {
      await copyFile(originalFilePath, newPath)
    } catch (error) {
      log.error('BG-IMG Copy Failed', error)
      throw error
    }
    return `img: ${fileName.replace(/\\/g, '/')}`
  }
}
