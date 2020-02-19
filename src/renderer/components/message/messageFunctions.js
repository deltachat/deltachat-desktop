const { ipcRenderer, remote, shell } = window.electron_functions

import { getLogger } from '../../../shared/logger'
const log = getLogger('render/msgFunctions')
/**
 * @typedef {{chatId: number,
      duration: number,
      file: string,
      fromId: number,
      id: number,
      receivedTimestamp: number,
      sortTimestamp: number,
      text: string,
      timestamp: number,
      hasLocation: boolean,
      viewType: number,
      state: number,
      hasDeviatingTimestamp: 1|0,
      showPadlock: boolean,
      summary: any,
      isSetupmessage: boolean,
      isInfo: boolean,
      isForwarded: boolean}} MsgObject
 * json representation of the message object we get from the backend
 */

/**
 * @param {MsgObject} msg
 */
export function onDownload (msg) {
  window.preload_functions.downloadFile(msg.file)
}

/**
 * @param {MsgObject} msg
 */
export function openAttachmentInShell (msg) {
  if (!shell.openItem(msg.file)) {
    log.info("file couldn't be opened, try saving it in a different place and try to open it from there")
  }
}
