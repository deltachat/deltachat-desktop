import { ipcRenderer, remote } from 'electron'
const log = require('../logger').getLogger('renderer/chatView')

export function sendToBackend(event, ...args) {
  log.debug(`sendToBackend: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  ipcRenderer.send(event, ...args)
}

export const ipcBackend = ipcRenderer
