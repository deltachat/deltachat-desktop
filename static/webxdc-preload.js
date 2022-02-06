//@ts-check
;(() => {
  const { contextBridge, ipcRenderer } = require('electron')
  let is_ready = false

  /**
   * @type {Parameters<import('./webxdc').Webxdc["setUpdateListener"]>[0]|null}
   */
  let callback = null
  ipcRenderer.on('webxdc.statusUpdate', (_ev, update) => {
    callback && callback(update)
  })

  /**
   * @type {import('./webxdc').Webxdc}
   */

  const api = {
    selfAddr: '?Setup Missing?',
    selfName: '?Setup Missing?',
    setUpdateListener: cb => {
      callback = cb
    },
    getAllUpdates: () => ipcRenderer.invoke('webxdc.getAllUpdates'),
    sendUpdate: (update, description) =>
      ipcRenderer.invoke('webxdc.sendUpdate', update, description),
  }

  contextBridge.exposeInMainWorld('webxdc_internal', {
    setup: (selfAddr, selfName) => {
      if (is_ready) {
        return
      }
      api.selfAddr = Buffer.from(selfAddr, 'base64').toString('utf-8')
      api.selfName = Buffer.from(selfName, 'base64').toString('utf-8')

      // be sure that webxdc.js was included
      contextBridge.exposeInMainWorld('webxdc', api)
      is_ready = true
    },
  })

  window.addEventListener('keydown', ev => {
    if (ev.key == 'F12') {
      ipcRenderer.invoke('webxdc.toggle_dev_tools')
      ev.preventDefault()
      ev.stopImmediatePropagation()
      ev.stopPropagation()
    }
  })
})()
