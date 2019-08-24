import { ipcRenderer } from 'electron'
const log = require('../logger').getLogger('renderer/chatView')

export function sendToBackend (event, ...args) {
  log.debug(`sendToBackend: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  ipcRenderer.send(event, ...args)
}

// Call a dc method without blocking the renderer process. Return value
// of the dc method is the first argument to cb
export function callDcMethod (fnName, args, cb) {
  if (!Array.isArray(args)) args = [args]
  sendToBackend('callDCMethod', fnName, args)
  ipcRenderer.once('CALL_DC_METHOD_RETURN_' + fnName, (_ev, returnValue) => {
    cb(returnValue)
  })
}

export const ipcBackend = ipcRenderer
