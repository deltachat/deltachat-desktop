import { BrowserWindow } from 'electron'
import { DesktopSettings } from './desktop_settings'
import { platform } from 'os'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('contentProtection')

function updateContentProtection(windows: BrowserWindow, enabled: boolean) {
  windows.setContentProtection(enabled)
  if (platform() !== 'darwin' && platform() !== 'win32') {
    log.warn('setContentProtection not available on your platform', platform())
  }
}

export function setContentProtection(windows: BrowserWindow) {
  updateContentProtection(
    windows,
    DesktopSettings.state.contentProtectionEnabled
  )
}

export function updateContentProtectionOnAllActiveWindows(enabled: boolean) {
  for (const win of BrowserWindow.getAllWindows()) {
    updateContentProtection(win, enabled)
  }
}
