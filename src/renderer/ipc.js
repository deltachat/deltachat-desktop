import { ipcRenderer } from 'electron'
const log = require('../logger').getLogger('renderer/ipc')

export function sendToBackend (event, ...args) {
  log.debug(`sendToBackend: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  ipcRenderer.send(event, ...args)
}

// Call a dc method without blocking the renderer process. Return value
// of the dc method is the first argument to cb
var call_dc_method_identifier = -1
export function callDcMethod (methodName, args, cb) {
  const identifier = call_dc_method_identifier++
  if (identifier >= Number.MAX_SAFE_INTEGER - 1) call_dc_method_identifier = -1
  const ignoreReturn = typeof cb !== 'function'
  const eventName = ignoreReturn ? 'EVENT_DC_DISPATCH' : 'EVENT_DC_DISPATCH_CB'

  sendToBackend(eventName, identifier, methodName, args)

  if (ignoreReturn) return

  ipcRenderer.once(`EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`, (_ev, returnValue) => {
    log.debug(`EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`, 'Got back return: ', returnValue)
    cb(returnValue)
  })
}

export function callDcMethodAsync (fnName, args) {
  return new Promise((resolve, reject) => callDcMethod(fnName, args, resolve))
}

export const ipcBackend = ipcRenderer
