import { powerMonitor } from 'electron'
import { window } from './windows/main'

function onResumeFromSleep() {
  window?.webContents.send('onResumeFromSleep')
}

export function initialisePowerMonitor() {
  powerMonitor.on('resume', onResumeFromSleep)
  powerMonitor.on('unlock-screen', onResumeFromSleep)
  powerMonitor.on('user-did-become-active', onResumeFromSleep)
}
