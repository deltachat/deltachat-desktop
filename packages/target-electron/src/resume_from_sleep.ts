import { powerMonitor } from 'electron'

import { send } from './windows/main.js'

function onResumeFromSleep() {
  send('onResumeFromSleep')
}

export function initialisePowerMonitor() {
  powerMonitor.on('resume', onResumeFromSleep)
  powerMonitor.on('unlock-screen', onResumeFromSleep)
  powerMonitor.on('user-did-become-active', onResumeFromSleep)
}
