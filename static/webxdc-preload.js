//@ts-check
;(() => {
  const { contextBridge, ipcRenderer } = require('electron')
  let is_ready = false

  /**
   * @type {Parameters<import('./webxdc').Webxdc["setUpdateListener"]>[0]|null}
   */
  let callback = null
  var last_serial = 0
  let setUpdateListenerPromise = null
  const onStatusUpdate = async () => {
    if (callback) {
      for (let update of await ipcRenderer.invoke(
        'webxdc.getAllUpdates',
        last_serial
      )) {
        last_serial = update.serial
        callback(update)
      }
      if (setUpdateListenerPromise) {
        setUpdateListenerPromise()
        setUpdateListenerPromise = null
      }
    }
  }
  ipcRenderer.on('webxdc.statusUpdate', _ev => {
    onStatusUpdate()
  })

  /**
   * @type {import('./webxdc').Webxdc}
   */

  const api = {
    selfAddr: '?Setup Missing?',
    selfName: '?Setup Missing?',
    setUpdateListener: (cb, start_serial = 0) => {
      last_serial = start_serial
      callback = cb
      const promise = new Promise((res, _rej) => {
        setUpdateListenerPromise = res
      })
      onStatusUpdate()
      return promise
    },
    getAllUpdates: () => {
      console.error(
        'getAllUpdates is deprectated an will removed in the future, it also returns an empty array now, so you really should use setUpdateListener instead.'
      )
      return Promise.resolve([])
    },
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
