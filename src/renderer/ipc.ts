/**
 * Encapsulate frontend <-> backend communication
 * to be able to switch this layer later on...
 */

import { ipcRenderer, remote, clipboard as _clipboard } from 'electron'
import { ExtendedApp, AppState } from '../shared/shared-types'
import logger from '../shared/logger'

const log = logger.getLogger('renderer/ipc')    

export const ipcBackend = ipcRenderer

export const appState: AppState = (remote.app as ExtendedApp).state 

export const showOpenDialog = remote.dialog.showOpenDialog  

export const openExternal = remote.shell.openExternal

export const openItem = remote.shell.openItem

export const showSaveDialog = remote.dialog.showSaveDialog

export const showMessageBox = remote.dialog.showMessageBox

export const getPath = remote.app.getPath 

export const clipboard = _clipboard

var backendLoggingStarted = false
export function startBackendLogging () {
  if (backendLoggingStarted === true) return log.error('Backend logging is already started!')
  backendLoggingStarted = true

  ipcBackend.on('ALL', (e, eName, ...args) => log.debug('backend', eName, ...args))
  ipcBackend.on('error', (e, ...args) => log.error(...args))
}

export function sendToBackend (event: string, ...args: any[]) {
  log.debug(`sendToBackend: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  ipcRenderer.send(event, ...args)
}

export function sendToBackendSync (event: string, ...args: any[]) {
  log.debug(`sendToBackendSync: ${event} ${args.join(' ')}`)
  ipcRenderer.send('ALL', event, ...args)
  return ipcRenderer.sendSync(event, ...args)
}

// Call a dc method without blocking the renderer process. Return value
// of the dc method is the first argument to cb
var callDcMethodIdentifier = 0
export function callDcMethod (methodName: string, args?: any[], cb?: any) {
  const identifier = callDcMethodIdentifier++
  if (identifier >= Number.MAX_SAFE_INTEGER - 1) callDcMethodIdentifier = 0
  const ignoreReturn = typeof cb !== 'function'
  const eventName = ignoreReturn ? 'EVENT_DC_DISPATCH' : 'EVENT_DC_DISPATCH_CB'

  sendToBackend(eventName, identifier, methodName, args)

  if (ignoreReturn) return

  ipcRenderer.once(`EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`, (_ev, returnValue) => {
    log.debug(`EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`, 'Got back return: ', returnValue)
    cb(returnValue)
  })
}

export function callDcMethodAsync (fnName: string, args: any[]) {
  return new Promise((resolve, reject) => callDcMethod(fnName, args, resolve))
}

export function mainProcessUpdateBadge () {
  ipcRenderer.send('update-badge')
}

export function saveLastChatId (chatId: number) {
  ipcRenderer.send('saveLastChatId', chatId)
}

/**
 * get the last selected chats id from previous session
 */
export function getLastSelectedChatId () {
  return ipcRenderer.sendSync('getLastSelectedChatId')
}

export function openHelp () {
  ipcRenderer.send('help', window.localeData.locale)
}

ipcRenderer.on('showHelpDialog', openHelp)
