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
      case 'startCall': {
        location.hash = '#startCall'
        break
      }
      case 'answer': {
        location.hash = `onAnswer=${btoa(e.data.answer)}`
        break
      }
      /**
       * Note that this is unused when
       * {@linkcode useBuiltinAcceptCallPrompt} === true
       */
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

if (location.search.includes('playRingtone')) {
  // TODO perf: sometimes, according to developer tools,
  // the audio file request is not completed until `getUserMedia` completes,
  // resulting in delayed playback of the ringtone.
  const audio = document.createElement('audio')
  audio.loop = true
  audio.autoplay = true
  audio.src = '/ringtone'
  audio.play()

  const intervalId = setInterval(() => {
    if (navigator.userActivation.isActive) {
      stopRingtoneAndCleanup()
    }
  }, 1000)

  /**
   * @type {Array<keyof DocumentEventMap>}
   */
  const eventNames = ['click', 'keydown', 'mousedown', 'touchstart']
  const stopRingtoneAndCleanup = () => {
    audio.pause()
    // To make sure that things gets GCd.
    audio.src = ''

    clearInterval(intervalId)

    for (const eventName of eventNames) {
      document.removeEventListener(eventName, stopRingtoneAndCleanup)
    }
  }
  for (const eventName of eventNames) {
    document.addEventListener(eventName, stopRingtoneAndCleanup, {
      passive: true,
    })
  }
}

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
  getAvatar() {
    return '/avatar'
  },
})
