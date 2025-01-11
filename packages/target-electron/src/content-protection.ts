import { BrowserWindow } from 'electron'
import { DesktopSettings } from './desktop_settings'
import { platform } from 'os'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('contentProtection')

function updateContentProtection(windows: BrowserWindow, enabled: boolean) {
  if (platform() === 'darwin' || platform() === 'win32') {
    windows.setContentProtection(enabled)
  } else {
    log.error('setContentProtection not available on your platform', platform())
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
