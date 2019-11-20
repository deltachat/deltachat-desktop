const path = require('path')
const { remote, ipcRenderer } = require('electron')

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
  const defaultPath = path.join(remote.app.getPath('downloads'), path.basename(msg.file))
  remote.dialog.showSaveDialog({
    defaultPath
  }, (filename) => {
    if (filename) ipcRenderer.send('saveFile', msg.file, filename)
  })
}
