const { openItem } = window.electron_functions

import { getLogger } from '../../../../shared/logger'
const log = getLogger('render/msgFunctions')
import { Message } from 'deltachat-node'
/**
 * json representation of the message object we get from the backend
 */
type MsgObject = ReturnType<typeof Message.prototype.toJson>

export function onDownload(msg: MsgObject) {
  window.preload_functions.downloadFile(msg.file)
}

export function openAttachmentInShell(msg: MsgObject) {
  if (!openItem(msg.file)) {
    log.info(
      "file couldn't be opened, try saving it in a different place and try to open it from there"
    )
  }
}
