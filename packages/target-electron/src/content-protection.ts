import { BrowserWindow } from 'electron'
import { DesktopSettings } from './desktop_settings'
import { platform } from 'os'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('contentProtection')

function updateContentProtection(window: BrowserWindow, enabled: boolean) {
  window.setContentProtection(enabled)
  if (enabled && platform() !== 'darwin' && platform() !== 'win32') {
    log.warn('setContentProtection not available on your platform', platform())
  }
}

export function setContentProtection(window: BrowserWindow) {
  updateContentProtection(
    window,
    DesktopSettings.state.contentProtectionEnabled
  )
}

export function updateContentProtectionOnAllActiveWindows(enabled: boolean) {
  for (const win of BrowserWindow.getAllWindows()) {
    updateContentProtection(win, enabled)
  }
}
