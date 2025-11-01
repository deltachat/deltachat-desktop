/**
 * @typedef {import('@webxdc/types').RealtimeListener} RT
 * @type {RT}
 */
class RealtimeListener {
  constructor(sendRealtime, leaveRealtime) {
    this.listener = null
    this.trashed = false
    this.sendRealtime = sendRealtime
    this.leaveRealtime = leaveRealtime
  }

  is_trashed() {
    return this.trashed
  }

  receive(data) {
    if (this.trashed) {
      throw new Error('realtime listener is trashed and can no longer be used')
    }
    if (this.listener) {
      this.listener(data)
    }
  }

  setListener(listener) {
    this.listener = listener
  }

  send(data) {
    if (!(data instanceof Uint8Array)) {
      throw new Error('realtime listener data must be a Uint8Array')
    }
    if (this.trashed) {
      throw new Error('realtime listener is trashed and can no longer be used')
    }
    this.sendRealtime(Array.from(data))
  }

  leave() {
    this.trashed = true
    this.leaveRealtime()
  }
}

//@ts-check
;(() => {
  const { contextBridge, ipcRenderer } = require('electron')
  // setup is finished
  let is_ready = false

  // used to replace the location.href of the iframe if
  // setLocation was called before all connections were filled
  let locationUrl = ''

  /**
   * @type {Parameters<import('@webxdc/types').Webxdc["setUpdateListener"]>[0]|null}
   */
  let callback = null
  /** @type {RT | null} */
  let realtimeListener = null
  let last_serial = 0
  let setUpdateListenerPromise = null
  let is_running = false
  let scheduled = false
  const innerOnStatusUpdate = async () => {
    const updates = JSON.parse(
      await ipcRenderer.invoke('webxdc.getAllUpdates', last_serial)
    )
    for (const update of updates) {
      last_serial = update.max_serial
      callback(update)
    }
    if (setUpdateListenerPromise) {
      setUpdateListenerPromise()
      setUpdateListenerPromise = null
    }
  }

  const onStatusUpdate = async () => {
    if (is_running) {
      scheduled = true
      return
    }
    is_running = true
    if (callback) {
      await innerOnStatusUpdate()
    }
    if (scheduled) {
      scheduled = false
      await onStatusUpdate()
      is_running = false
    } else {
      is_running = false
    }
  }
  ipcRenderer.on('webxdc.statusUpdate', _ev => {
    onStatusUpdate()
  })

  ipcRenderer.on('webxdc.realtimeData', (ev_, data) => {
    if (realtimeListener && !realtimeListener.is_trashed()) {
      realtimeListener.receive(Uint8Array.from(data))
    }
  })

  /**
   * @type {import('@webxdc/types').Webxdc}
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
    joinRealtimeChannel: cb => {
      if (realtimeListener && !realtimeListener.is_trashed()) {
        throw new Error('realtime listener already exists')
      }

      realtimeListener = new RealtimeListener(
        arr => ipcRenderer.invoke('webxdc.sendRealtimeData', arr),
        () => ipcRenderer.invoke('webxdc.leaveRealtimeChannel')
      )
      ipcRenderer.invoke('webxdc.sendRealtimeAdvertisement')
      realtimeListener.setListener =
        realtimeListener.setListener.bind(realtimeListener)
      realtimeListener.send = realtimeListener.send.bind(realtimeListener)
      realtimeListener.leave = realtimeListener.leave.bind(realtimeListener)
      realtimeListener.is_trashed =
        realtimeListener.is_trashed.bind(realtimeListener)
      return realtimeListener
    },
    getAllUpdates: () => {
      console.error(
        'getAllUpdates is deprecated and will be removed in the future, it also returns an empty array now, so you really should use setUpdateListener instead.'
      )
      return Promise.resolve([])
    },
    sendUpdate: (update, description) => {
      if (description) {
        console.error(
          'parameter description in sendUpdate is deprecated and will be removed in the future'
        )
      }
      ipcRenderer.invoke('webxdc.sendUpdate', JSON.stringify(update))
    },
    sendToChat: async content => {
      if (!content.file && !content.text) {
        return Promise.reject(
          'Error from sendToChat: Invalid empty message, at least one of text or file should be provided'
        )
      }
      /** @type {(file: Blob) => Promise<string>} */
      const blob_to_base64 = file => {
        const data_start = ';base64,'
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            /** @type {string} */
            //@ts-ignore
            const data = reader.result
            resolve(data.slice(data.indexOf(data_start) + data_start.length))
          }
          reader.onerror = () => reject(reader.error)
        })
      }

      /** @type {{file_name: string, file_content: string} | null} */
      let file = null
      if (content.file) {
        let base64Content
        if (!content.file.name) {
          return Promise.reject('file name is missing')
        }
        if (
          Object.keys(content.file).filter(key =>
            ['blob', 'base64', 'plainText'].includes(key)
          ).length > 1
        ) {
          return Promise.reject(
            'you can only set one of `blob`, `base64` or `plainText`, not multiple ones'
          )
        }

        // @ts-ignore - needed because typescript imagines that blob would not exist
        if (content.file.blob instanceof Blob) {
          // @ts-ignore - needed because typescript imagines that blob would not exist
          base64Content = await blob_to_base64(content.file.blob)
          // @ts-ignore - needed because typescript imagines that base64 would not exist
        } else if (typeof content.file.base64 === 'string') {
          // @ts-ignore - needed because typescript imagines that base64 would not exist
          base64Content = content.file.base64
          // @ts-ignore - needed because typescript imagines that plainText would not exist
        } else if (typeof content.file.plainText === 'string') {
          base64Content = await blob_to_base64(
            // @ts-ignore - needed because typescript imagines that plainText would not exist
            new Blob([content.file.plainText])
          )
        } else {
          return Promise.reject(
            'data is not set or wrong format, set one of `blob`, `base64` or `plainText`, see webxdc documentation for sendToChat'
          )
        }

        file = {
          file_name: content.file.name,
          file_content: base64Content,
        }
      }

      await ipcRenderer.invoke('webxdc.sendToChat', file, content.text)
    },
    importFiles: filters => {
      const element = document.createElement('input')
      element.type = 'file'
      element.accept = [
        ...(filters.extensions || []),
        ...(filters.mimeTypes || []),
      ].join(',')
      element.multiple = filters.multiple || false
      const promise = new Promise((resolve, _reject) => {
        element.onchange = _ev => {
          console.log('element.files', element.files)
          const files = Array.from(element.files || [])
          document.body.removeChild(element)
          resolve(files)
        }
      })
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      console.log(element)
      return promise
    },
  }

  contextBridge.exposeInMainWorld('webxdc_internal', {
    setup: (selfAddr, selfName, sendUpdateInterval, sendUpdateMaxSize) => {
      if (is_ready) {
        return
      }
      api.selfAddr = Buffer.from(selfAddr, 'base64').toString('utf-8')
      api.selfName = Buffer.from(selfName, 'base64').toString('utf-8')
      api.sendUpdateInterval = sendUpdateInterval
      api.sendUpdateMaxSize = sendUpdateMaxSize

      // be sure that webxdc.js was included
      contextBridge.exposeInMainWorld('webxdc', api)
      is_ready = true

      window.frames[0].window.addEventListener('keydown', keydown_handler)
    },
    setInitialIframeSrc: async () => {
      const iframe = document.getElementById('frame')
      iframe.src = locationUrl !== '' ? locationUrl : 'index.html'
      iframe.contentWindow.window.addEventListener('keydown', keydown_handler)
    },
    /**
     * called via webContents.executeJavaScript
     */
    setLocationUrl(base64EncodedHref) {
      locationUrl = Buffer.from(base64EncodedHref, 'base64').toString('utf8')
      if (locationUrl && locationUrl !== '') {
        window.frames[0].window.location = locationUrl
      }
    },
  })

  const keydown_handler = ev => {
    if (ev.code == 'Escape') {
      ipcRenderer.invoke('webxdc.exitFullscreen')
    }
  }

  window.addEventListener('keydown', keydown_handler)
  window.onload = () => {
    const frame = document.getElementById('frame')
    if (frame) {
      frame.contentWindow.window.addEventListener('keydown', keydown_handler)
    } else {
      console.log('attaching F12 handler failed, frame not found')
    }
  }

  contextBridge.exposeInMainWorld('webxdc_custom', {
    /**
     *
     * @param {string} file_name
     * @param {string} base64_content
     * @param {string | undefined} icon_data_url
     */
    desktopDragFileOut: (file_name, base64_content, icon_data_url) => {
      ipcRenderer.invoke(
        'webxdc:custom:drag-file-out',
        file_name,
        base64_content,
        icon_data_url
      )
    },
  })
})()
