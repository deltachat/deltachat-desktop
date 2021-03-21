import { getLogger } from '../shared/logger'

/**
 * Encapsulate frontend <-> backend communication
 * to be able to switch this layer later on...
 */

const { ipcRenderer } = window.electron_functions
const log = getLogger('renderer/ipc')

export const ipcBackend = ipcRenderer

// Listen to DC/Backend events in a convenient way. Returns a callback to remove the
// event listener. You can bind the same event listener to multiple events by passing them
// as an array of strings.
export function onDCEvent(
  event: string | string[],
  cb: (data1: string, data2: string) => void
) {
  const wrapperCb = (_: any, [data1, data2]: [string, string]) => {
    cb(data1, data2)
  }
  if (Array.isArray(event)) {
    event.forEach(e => ipcBackend.on(e, wrapperCb))
    return () => event.forEach(e => ipcBackend.removeListener(e, wrapperCb))
  } else {
    ipcBackend.on(event, wrapperCb)
    return () => ipcBackend.removeListener(event, wrapperCb)
  }
}

let backendLoggingStarted = false
export function startBackendLogging() {
  if (backendLoggingStarted === true)
    return log.error('Backend logging is already started!')
  backendLoggingStarted = true

  ipcBackend.on('ALL', (_e, eName, ...args) =>
    log.debug('backend', eName, ...args)
  )
  ipcBackend.on('error', (_e, ...args) => log.error(...args))
}

export function sendToBackend(event: string, ...args: any[]) {
  log.debug(`sendToBackend: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  ipcRenderer.send(event, ...args)
}

// Call a dc method without blocking the renderer process. Return value
// of the dc method is the first argument to cb
let callDcMethodIdentifier = 0
// private function, please use `DeltaBackend.call` instead
function callDcMethod(
  methodName: string,
  args: any[],
  cb?: (err: Error, returnValue: any) => void
) {
  const identifier = callDcMethodIdentifier++
  if (identifier >= Number.MAX_SAFE_INTEGER - 1) callDcMethodIdentifier = 0
  const ignoreReturn = typeof cb !== 'function'
  const eventName = ignoreReturn ? 'EVENT_DC_DISPATCH' : 'EVENT_DC_DISPATCH_CB'

  sendToBackend(eventName, identifier, methodName, args)

  if (ignoreReturn) return

  const onError = (_ev: any, err: any) => {
    log.debug(
      `EVENT_DD_DISPATCH_RETURN_ERR_${identifier}_${methodName}`,
      'Got back return: ',
      err
    )
    removeListeners()
    cb(err, null)
  }

  const onSuccess = (_ev: any, returnValue: any) => {
    log.debug(
      `EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`,
      'Got back return: [truncated]'
    )
    /*log.debug(
      `EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`,
      'Got back return: [',
      returnValue
    )*/
    removeListeners()
    cb(null, returnValue)
  }

  const removeListeners = () => {
    ipcRenderer.removeAllListeners(
      `EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`
    )
    ipcRenderer.removeAllListeners(
      `EVENT_DD_DISPATCH_RETURN_ERR_${identifier}_${methodName}`
    )
  }

  ipcRenderer.once(
    `EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`,
    onSuccess
  )
  ipcRenderer.once(
    `EVENT_DD_DISPATCH_RETURN_ERR_${identifier}_${methodName}`,
    onError
  )
}

export function _callDcMethodAsync(
  fnName: string,
  ...args: any[]
): Promise<any> {
  return new Promise((resolve, reject) =>
    callDcMethod(fnName, args, (err: Error, returnValue: any) => {
      if (err) return reject(err)
      resolve(returnValue)
    })
  )
}

// move this part to the deltachat backend / deltachatcontroller

export function saveLastChatId(chatId: number) {
  ipcRenderer.send('saveLastChatId', chatId)
}

/**
 * get the last selected chats id from previous session
 */
export function getLastSelectedChatId() {
  return ipcRenderer.sendSync('getLastSelectedChatId')
}

// end-move
