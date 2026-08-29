import { powerMonitor } from 'electron'
import SleepTime from 'sleeptime'

import { send } from './windows/main.js'

function onResumeFromSleep() {
  send('onResumeFromSleep')
}

export function initialisePowerMonitor() {
  powerMonitor.on('resume', onResumeFromSleep)
  powerMonitor.on('unlock-screen', onResumeFromSleep)
  powerMonitor.on('user-did-become-active', onResumeFromSleep)

  // Looks like `powerMonitor.on('resume'` doesn't work
  // if certain permissions are not given to the app,
  // so let's have this dumb `setInterval` check.
  //
  // It might fire false-positives, but we're generally fine with this,
  // as `onResumeFromSleep` is only used for `rpc.maybeNetwork()`
  // and updating timestamps, so it's only about performance basically.
  new SleepTime(
    onResumeFromSleep,
    // `setInterval` period. `onResumeFromSleep` might be delayed
    // by up to this amount of milliseconds.
    10 * 1000
  )
}
