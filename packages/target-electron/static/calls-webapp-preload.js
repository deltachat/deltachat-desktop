//@ts-check
const { contextBridge, ipcRenderer } = require('electron')

let resolvePortPromise
/** @type {Promise<Electron.IpcRendererEvent['ports'][number]>} */
const portP = new Promise(r => (resolvePortPromise = r))
ipcRenderer.once('port', e => {
  console.log('Received MessagePort from main process')
  resolvePortPromise(e.ports[0])
})

/** @type {(servers: string) => void} */
let onIceServers
/** @type {Promise<string>} */
const iceServersP = new Promise(r => (onIceServers = r))

portP.then(port => {
  port.onmessage = e => {
    console.log('Received message from port', e.data)
    switch (e.data.type) {
      case 'answer': {
        location.hash = `onAnswer=${btoa(e.data.answer)}`
        break
      }
      case 'offer': {
        location.hash = `acceptCall=${btoa(e.data.offer)}`
        break
      }
      case 'iceServers': {
        onIceServers(e.data.iceServersString)
        break
      }
      default: {
        console.warn('Got unrecognized message type from port', e)
      }
    }
  }
  port.start()
})

// See https://github.com/deltachat/calls-webapp/blob/f92bea8ed1a7de6edfbdcdd4893b50438be56b24/README.md#integrating
contextBridge.exposeInMainWorld('calls', {
  /**
   * @returns {Promise<string>}
   */
  async getIceServers() {
    return await iceServersP
  },
  /**
   * @param {unknown} offerPayload
   * @returns {Promise<void>}
   */
  async startCall(offerPayload) {
    console.log('startCall called with', offerPayload)

    if (typeof offerPayload !== 'string') {
      throw new Error(`expected a string parameter, got ${typeof offerPayload}`)
    }

    const port = await portP
    port.postMessage(offerPayload)
  },
  /**
   * @param {unknown} answerPayload
   */
  async acceptCall(answerPayload) {
    console.log('acceptCall called with', answerPayload)

    if (typeof answerPayload !== 'string') {
      throw new Error(
        `expected a string parameter, got ${typeof answerPayload}`
      )
    }

    const port = await portP
    port.postMessage(answerPayload)
  },
  /**
   * @returns {void}
   */
  endCall() {
    window.close()
  },
})
