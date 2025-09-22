import {
  BrowserWindow,
  dialog,
  Menu,
  MessageChannelMain,
  net,
  protocol,
  session,
} from 'electron/main'
import { join } from 'path'
import { appIcon, htmlDistDir } from '../application-constants'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { getDCJsonrpcRemote } from '../ipc'
import { pathToFileURL } from 'node:url'

const log = getLogger('windows/video-call')

export function startOutgoingVideoCall(accountId: number, chatId: number) {
  log.info('starting outgoing video call', { accountId, chatId })

  const { offerPromise, windowClosed, closeWindow } = openVideoCallWindow(
    accountId,
    CallDirection.Outgoing,
    {}
  )

  const jsonrpcRemote = getDCJsonrpcRemote()

  ;(async () => {
    const { offer, onAnswer } = await offerPromise
    const callMessageId = await jsonrpcRemote.rpc.placeOutgoingCall(
      accountId,
      chatId,
      offer
    )
    const { done, onCallAcceptedOnThisDevice: _ } = handleCallEnd(
      jsonrpcRemote,
      accountId,
      callMessageId,
      windowClosed,
      closeWindow
    )
    log.info('Call invitation sent')

    // Make sure there are no `await`s between `placeOutgoingCall` and this.
    const { answerP, removeListenerAndResolvePromiseToNull } =
      listenForAnswerFromCallee(jsonrpcRemote, accountId, callMessageId)
    done.then(removeListenerAndResolvePromiseToNull)
    const answer = await answerP
    if (answer == null) {
      log.info('Given up on waiting for answer from callee')
      return
    }
    log.info('Received answer from callee')
    onAnswer(answer)
  })()
}

/**
 * Listen for and fully handle `IncomingCall` core events,
 * by opening "Incoming call" windows.
 * @returns "stop handling" function
 */
export function startHandlingIncomingVideoCalls(
  jsonrpcRemote: ReturnType<typeof getDCJsonrpcRemote>
): () => void {
  const incomingCallListener = (
    eventAccountId: number,
    { msg_id, place_call_info }: { msg_id: number; place_call_info: string }
  ) => {
    log.info('got IncomingCall event', eventAccountId, msg_id)

    openIncomingVideoCallWindow(eventAccountId, msg_id, place_call_info)
  }

  jsonrpcRemote.on('IncomingCall', incomingCallListener)
  return () => jsonrpcRemote.off('IncomingCall', incomingCallListener)
}

function openIncomingVideoCallWindow(
  accountId: number,
  callMessageId: number,
  callerWebrtcOffer: string
) {
  log.info('received incoming call', { accountId, callMessageId })

  const { answerPromise, windowClosed, closeWindow } = openVideoCallWindow(
    accountId,
    CallDirection.Incoming,
    {
      callerWebrtcOffer,
    }
  )

  const jsonrpcRemote = getDCJsonrpcRemote()

  const { onCallAcceptedOnThisDevice } = handleCallEnd(
    jsonrpcRemote,
    accountId,
    callMessageId,
    windowClosed,
    closeWindow
  )

  //
  ;(async () => {
    const answer = await answerPromise
    log.info('Call WebRTC answer generated, sending "accept call" message')
    jsonrpcRemote.rpc.acceptIncomingCall(accountId, callMessageId, answer)
    onCallAcceptedOnThisDevice()
  })()
}

const enum CallDirection {
  Incoming,
  Outgoing,
}

function openVideoCallWindow<T extends CallDirection>(
  accountId: number,
  callDirection: T,
  {
    callerWebrtcOffer,
  }: T extends CallDirection.Incoming
    ? {
        callerWebrtcOffer: string
      }
    : {
        callerWebrtcOffer?: undefined
      }
): {
  closeWindow: () => void
  windowClosed: Promise<void>
} & (T extends CallDirection.Incoming
  ? {
      answerPromise: Promise<string>
    }
  : {
      offerPromise: Promise<{
        offer: string
        /**
         * Must be called when the call is answered by the callee
         */
        onAnswer: (answer: string) => void
      }>
    }) {
  const ses = session.fromPartition(`calls-webapp_${accountId}`)

  if (!ses.protocol.isProtocolHandled(SCHEME_NAME)) {
    ses.protocol.handle(SCHEME_NAME, returnCallsWebappFile)
  }

  const win = new BrowserWindow({
    webPreferences: {
      session: ses,

      // Basically the same as for our WebXDC window.
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,

      autoplayPolicy: 'no-user-gesture-required',

      // devTools: true by default
      javascript: true,
      preload: join(htmlDistDir(), 'calls-webapp-preload.js'),
    },
    autoHideMenuBar: true,
    // The `calls-webapp` theme is dark. Reduce flashing.
    backgroundColor: '#000',
    // TODO
    title: 'Call',
    icon: appIcon(),
    // TODO
    // alwaysOnTop: main_window?.isAlwaysOnTop(),
  })
  // TODO
  // setContentProtection(webxdcWindow)
  //
  // TODO maybe remember bounds.
  //
  // Maybe we could add a setting for this, i.e. "Allow calls to bypass VPN".
  // win.webContents.setWebRTCIPHandlingPolicy()

  // TODO proper menu?
  win.setMenu(Menu.buildFromTemplate([{ role: 'toggleDevTools' }]))

  const jsonrpcRemote = getDCJsonrpcRemote()

  // prevent reload and navigation
  win.webContents.on('will-navigate', ev => {
    ev.preventDefault()
  })

  // prevent the app from setting the window title
  // This might also be solved with `WebContentsView`?
  win.on('page-title-updated', ev => {
    ev.preventDefault()
  })

  const permission_handler = (
    permission: string,
    details: {
      // These can also be empty strings.
      requestingOrigin?: string
      requestingUrl?: string
      securityOrigin?: string
      isMainFrame?: boolean
    }
  ) => {
    if (
      (details.requestingOrigin && !isOriginGood(details.requestingOrigin)) ||
      (details.requestingUrl && !isOriginGood(details.requestingUrl)) ||
      (details.securityOrigin && !isOriginGood(details.securityOrigin)) ||
      (typeof details.isMainFrame === 'boolean' && !details.isMainFrame)
    ) {
      return false
    }

    return ['media'].includes(permission)
  }
  ses.setPermissionCheckHandler(
    (_wc, permission, requestingOrigin, details) => {
      return permission_handler(permission, {
        requestingOrigin,
        ...details,
      })
    }
  )
  ses.setPermissionRequestHandler((_wc, permission, callback, details) => {
    callback(permission_handler(permission, details))
  })

  const webAppMessagePort = (() => {
    // Docs: https://www.electronjs.org/docs/latest/api/message-channel-main
    const { port1, port2 } = new MessageChannelMain()
    win.webContents.postMessage('port', null, [port2])
    return port1
  })()

  // @ts-expect-error ts(2339) This API will be introduced later.
  if (jsonrpcRemote.rpc.iceServers != undefined) {
    // @ts-expect-error ts(2339) This API will be introduced later.
    jsonrpcRemote.rpc.iceServers(accountId).then((iceServersString: string) => {
      webAppMessagePort.postMessage({
        type: 'iceServers',
        iceServersString,
      })
    })
  } else {
    webAppMessagePort.postMessage({
      type: 'iceServers',
      iceServersString: JSON.stringify([
        {
          urls: [
            'turn:ci-chatmail.testrun.org',
            // Same , but by IP.
            'turn:49.12.217.82',
          ],
          username: 'ohV8aec1',
          credential: 'zo3theiY',
        },
      ]),
    })
  }

  if (callerWebrtcOffer != undefined) {
    // const _assert: CallDirection.Incoming = callDirection
    dialog
      .showMessageBox(win, {
        // TODO i18n
        // TODO from whom? And to which account?
        message: 'Incoming call',
        type: 'question',
        buttons: ['Decline', 'Answer'],
        defaultId: 0,
        cancelId: 0,
        signal: (() => {
          const abortController = new AbortController()
          win.once('closed', () => abortController.abort('window closed'))
          return abortController.signal
        })(),
      })
      .then(({ response }) => {
        const answer = response === 1
        if (answer) {
          webAppMessagePort.postMessage({
            type: 'offer',
            offer: callerWebrtcOffer,
          })
        } else {
          win.close()
        }
      })
  }

  /**
   * This is gonna be either an offer or an answer,
   * depending on {@linkcode callDirection}
   */
  const messageFromPagePromise = new Promise<string>(r => {
    webAppMessagePort.once('message', e => {
      if (typeof e.data !== 'string') {
        log.error('Invalid message type from calls-webapp window', e.data)
        return
      }
      r(e.data)
    })
  })
  webAppMessagePort.start()

  const hash =
    callDirection === CallDirection.Outgoing
      ? '#startCall'
      : // Otherwise we'll set the hash later, when the call gets accepted.
        ''
  win.webContents.loadURL(`${SCHEME_NAME}://${DUMMY_HOST_NAME}${hash}`, {
    extraHeaders: 'Content-Security-Policy: ' + CSP,
  })

  const windowClosed = new Promise<void>(r => win.once('closed', r))
  return {
    answerPromise: messageFromPagePromise,
    offerPromise: messageFromPagePromise.then(offer => ({
      offer,
      /**
       * Must be called when the call is answered by the callee
       */
      onAnswer: (answer: string) => {
        webAppMessagePort.postMessage({ type: 'answer', answer })
      },
    })),
    windowClosed,
    closeWindow: () => {
      if (win.isDestroyed()) {
        return
      }
      if (win.webContents.isDevToolsOpened()) {
        log.info(
          "closeWindow called, but dev tools are open, let's keep the window open"
        )
        return
      }
      win.close()
    },
  }
}

function listenForAnswerFromCallee(
  jsonrpcRemote: ReturnType<typeof getDCJsonrpcRemote>,
  accountId: number,
  callMessageId: number
): {
  answerP: Promise<null | string>
  /**
   * Must be called when the caller is no longer interested in the answer.
   * If {@linkcode answerP} has already resolved, calling this is not necessary.
   */
  removeListenerAndResolvePromiseToNull: () => void
} {
  let resolve: (answer: null | string) => void
  const answerP = new Promise<null | string>(res => {
    resolve = res
  })
  const callAcceptedListener = (
    eventAccountId: number,
    {
      msg_id,
      accept_call_info: answer,
    }: { msg_id: number; accept_call_info: string }
  ) => {
    log.info('got OutgoingCallAccepted event', eventAccountId, msg_id)
    if (eventAccountId !== accountId || msg_id !== callMessageId) {
      return
    }

    removeListener()
    resolve(answer)
  }

  jsonrpcRemote.on('OutgoingCallAccepted', callAcceptedListener)
  const removeListener = () =>
    jsonrpcRemote.off('OutgoingCallAccepted', callAcceptedListener)

  return {
    answerP,
    removeListenerAndResolvePromiseToNull: () => {
      removeListener()
      resolve(null)
    },
  }
}

/**
 * Fully handles call termination:
 * closes the window and invokes `rpc.endCall` as appropriate.
 * Be it when the incoming call gets accepted from another device,
 * when the window gets closed, or when `CallEnded` fires.
 */
function handleCallEnd(
  jsonrpcRemote: ReturnType<typeof getDCJsonrpcRemote>,
  accountId: number,
  callMessageId: number,
  windowClosed: Promise<void>,
  closeWindow: () => void
): {
  /**
   * Resolves when we are done with handling the call on this device,
   * when we're ready to clean everything up.
   */
  done: Promise<void>
  /**
   * If this is an incoming call, this must be called when we decide
   * to accept the call on this device.
   */
  onCallAcceptedOnThisDevice: () => void
} {
  let onDone!: () => void
  const done = new Promise<void>(r => (onDone = r))

  // Note that this event will never fire for outgoing calls. It's fine.
  const {
    /**
     * Does not resolve if the call didn't get accepted on another device.
     */
    incomingCallAcceptedOnOtherDevice,
    removeIncomingCallAcceptedListener,
  } = (() => {
    let resolve: () => void
    const p = new Promise<void>(r => (resolve = r))
    const listener = (
      eventAccountId: number,
      { msg_id }: { msg_id: number }
    ) => {
      log.info('got IncomingCallAccepted event', eventAccountId, msg_id)
      if (eventAccountId !== accountId || msg_id !== callMessageId) {
        return
      }
      resolve()
      removeListener()
    }
    jsonrpcRemote.on('IncomingCallAccepted', listener)
    const removeListener = () => {
      jsonrpcRemote.off('IncomingCallAccepted', listener)
    }
    done.then(removeListener)

    return {
      removeIncomingCallAcceptedListener: removeListener,
      incomingCallAcceptedOnOtherDevice: p,
    }
  })()
  const onCallAcceptedOnThisDevice = removeIncomingCallAcceptedListener

  const callEnded = (() => {
    let resolve: () => void
    const p = new Promise<void>(r => (resolve = r))
    const listener = (
      eventAccountId: number,
      { msg_id }: { msg_id: number }
    ) => {
      log.info('got CallEnded event', eventAccountId, msg_id)
      if (eventAccountId !== accountId || msg_id !== callMessageId) {
        return
      }
      resolve()
      removeListener()
    }
    jsonrpcRemote.on('CallEnded', listener)
    const removeListener = () => {
      jsonrpcRemote.off('CallEnded', listener)
    }
    done.then(removeListener)

    return p
  })()

  Promise.race<{ invokeEndCall: boolean }>([
    callEnded.then(() => ({ invokeEndCall: false })),
    incomingCallAcceptedOnOtherDevice.then(() => ({ invokeEndCall: false })),
    windowClosed.then(() => ({ invokeEndCall: true })),
  ])
    .then(({ invokeEndCall }) => {
      if (invokeEndCall) {
        jsonrpcRemote.rpc.endCall(accountId, callMessageId)
      }
      closeWindow()
    })
    .finally(onDone)

  return { done, onCallAcceptedOnThisDevice }
}

// See https://github.com/deltachat/calls-webapp/pull/20.
const CSP =
  "default-src 'none';\
style-src 'self' 'unsafe-inline';\
script-src 'self' 'unsafe-inline';\
img-src 'self' data:"

async function returnCallsWebappFile(request: GlobalRequest) {
  const url = URL.parse(request.url)
  if (url == null) {
    return makeResponse('', { status: 400 })
  }
  if (
    url.pathname !== '/' &&
    url.pathname !== '/index.html' &&
    url.pathname !== ''
  ) {
    return makeResponse('', { status: 404 })
  }

  const res = await net.fetch(
    pathToFileURL(join(htmlDistDir(), 'calls-webapp', 'index.html')).toString()
  )
  return makeResponse(res.body)
}
// Copy-pasted from webxdc.ts
function makeResponse(
  body: ConstructorParameters<typeof Response>[0],
  responseInit?: Omit<ResponseInit, 'headers'>
) {
  return new Response(body, {
    ...responseInit,
    headers: {
      'Content-Security-Policy': CSP,
    },
  })
}

const SCHEME_NAME = 'calls-webapp-scheme'
const DUMMY_HOST_NAME = 'calls-webapp-dummy-host'

/**
 * @see `origin_no_opaque` in the Tauri version.
 */
function isOriginGood(url: string) {
  const urlParsed = URL.parse(url)
  if (urlParsed == null) {
    return false
  }
  return (
    urlParsed.protocol === SCHEME_NAME + ':' &&
    urlParsed.host === DUMMY_HOST_NAME &&
    urlParsed.port === ''
  )
}

export function registerCallsWebappSchemeAsPrivileged() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: SCHEME_NAME,
      privileges: {
        // Needed for `getUserMedia`.
        secure: true,

        // Needed for videos to work.
        stream: true,
        standard: true,
      },
    },
  ])
}
