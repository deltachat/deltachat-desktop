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
      const updates = JSON.parse(
        await ipcRenderer.invoke('webxdc.getAllUpdates', last_serial)
      )
      for (let update of updates) {
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
        'getAllUpdates is deprecated and will be removed in the future, it also returns an empty array now, so you really should use setUpdateListener instead.'
      )
      return Promise.resolve([])
    },
    sendUpdate: (update, description) =>
      ipcRenderer.invoke(
        'webxdc.sendUpdate',
        JSON.stringify(update),
        description
      ),
    sendToChat: async content => {
      if (!content.file && !content.text) {
        return Promise.reject(
          'Error from sendToChat: either file or text need to be set'
        )
      }
      const data_start = ';base64,'
      /** @type {{file_name: string, file_content: string} | null} */
      let file = null
      if (content.file) {
        const base64Content =
          content.file &&
          (await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(content.file)
            reader.onload = () => {
              /** @type {string} */
              let data = reader.result
              resolve(data.slice(data.indexOf(data_start) + data_start.length))
            }
            reader.onerror = () => reject(reader.error)
          }))

        file = {
          file_name: content.file.name,
          file_content: base64Content,
        }
      }

      await ipcRenderer.invoke('webxdc.sendFileToChat', file, content.text)
    },
  }

  const connections = []

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

      window.frames[0].window.addEventListener('keydown', keydown_handler)
    },
    fill_up_connections: async () => {
      /** @type {HTMLProgressElement} */
      const loadingProgress = document.getElementById('progress')
      const numIterations = 50
      loadingProgress.max = numIterations
      const loadingDiv = document.getElementById('loading')
      const iframe = document.getElementById('frame')

      const cert = {
        certificates: [
          await RTCPeerConnection.generateCertificate({
            name: 'ECDSA',
            namedCurve: 'P-256',
          }),
        ],
      }

      try {
        for (let i = 0; i < numIterations; i++) {
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          connections.push(new RTCPeerConnection(cert))
          await new Promise(res => setTimeout(res, 0)) // this is to view loading bar, it returns to the ev loop
          loadingProgress.value = i + 1
        }
        try {
          connections.push(new RTCPeerConnection(cert))
          console.log('could create 501th connection, this should never happen')
          ipcRenderer.invoke('webxdc.exit')
        } catch (error) {
          loadingDiv.innerHTML = ''
          iframe.src = 'index.html'
          iframe.contentWindow.window.addEventListener(
            'keydown',
            keydown_handler
          )
        }
      } catch (error) {
        console.log('error loading, should crash/close window', error)
        ipcRenderer.invoke('webxdc.exit')
      }
    },
  })

  const keydown_handler = ev => {
    if (ev.key == 'F12') {
      ipcRenderer.invoke('webxdc.toggle_dev_tools')
      ev.preventDefault()
      ev.stopImmediatePropagation()
      ev.stopPropagation()
    } else if (ev.key == 'Escape') {
      ipcRenderer.invoke('webxdc.exitFullscreen')
    }
  }

  window.addEventListener('keydown', keydown_handler)
  window.onload = () => {
    const frame = document.getElementById('frame')
    if (frame)
      frame.contentWindow.window.addEventListener('keydown', keydown_handler)
    else console.log('attaching F12 handler failed, frame not found')
  }
})()
