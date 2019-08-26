import { ipcRenderer } from 'electron'
const log = require('../logger').getLogger('renderer/ipc')

export function sendToBackend (event, ...args) {
  log.debug(`sendToBackend: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  ipcRenderer.send(event, ...args)
}

// Call a dc method without blocking the renderer process. Return value
// of the dc method is the first argument to cb
export function callDcMethod (fnName, args, cb) {
  if (!Array.isArray(args)) args = [args]
  const ignoreReturn = typeof cb !== 'function'
  const eventName = ignoreReturn ? 'EVENT_DC_CALL_METHOD_IGNORE_RETURN' : 'EVENT_DC_CALL_METHOD'

  sendToBackend(eventName, fnName, args)

  if (ignoreReturn) return

  ipcRenderer.once('DD_DC_CALL_METHOD_RETURN_' + fnName, (_ev, returnValue) => {
    log.debug('DD_DC_CALL_METHOD_RETURN_' + fnName, 'Got back return: ', returnValue)
    cb(returnValue)
  })
}

export function callDcMethodAsync (fnName, args) {
  return new Promise((resolve, reject) => callDcMethod(fnName, args, resolve))
}

export const ipcBackend = ipcRenderer
