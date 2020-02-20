import path from 'path'
import { ipcBackend, openItem, showSaveDialog, getPath } from '../../ipc'

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
  const defaultPath = path.join(getPath('downloads'), path.basename(msg.file))
  showSaveDialog({ defaultPath }, (filename) => {
    if (filename) ipcBackend.send('saveFile', msg.file, filename)
  })
}

/**
 * @param {MsgObject} msg
 */
export function openAttachmentInShell (msg) {
  if (!openItem(msg.file)) {
    log.info("file couldn't be opened, try saving it in a different place and try to open it from there")
  }
}
