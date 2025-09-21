import {
  BrowserWindow,
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

  const { offerPromise, windowClosed } = openVideoCallWindow(accountId)

  const jsonrpcRemote = getDCJsonrpcRemote()

  ;(async () => {
    const { offer, onAnswer } = await offerPromise
    const callMessageId = await jsonrpcRemote.rpc.placeOutgoingCall(
      accountId,
      chatId,
      offer
    )
    windowClosed.then(() => {
      log.info('Call window closed, ending the call')
      jsonrpcRemote.rpc.endCall(accountId, callMessageId)
    })
    log.info('Call invitation sent')

    // Make sure there are no `await`s between `placeOutgoingCall` and this.
    const { answerP, removeListenerAndResolvePromiseToNull } =
      listenForAnswerFromCallee(jsonrpcRemote, accountId, callMessageId)
    windowClosed.then(removeListenerAndResolvePromiseToNull)
    const answer = await answerP
    if (answer == null) {
      log.info('Given up on waiting for answer from callee')
      return
    }
    log.info('Received answer from callee')
    onAnswer(answer)
  })()
}

function openVideoCallWindow(accountId: number): {
  windowClosed: Promise<void>
  offerPromise: Promise<{
    offer: string
    /**
     * Must be called when the call is answered by the callee
     */
    onAnswer: (answer: string) => void
  }>
} {
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

  const offerPromise = new Promise<string>(r => {
    webAppMessagePort.once('message', e => {
      if (typeof e.data !== 'string') {
        log.error('Invalid message type from calls-webapp window', e.data)
        return
      }
      r(e.data)
    })
  })
  webAppMessagePort.start()

  win.webContents.loadURL(`${SCHEME_NAME}://${DUMMY_HOST_NAME}#startCall`, {
    extraHeaders: 'Content-Security-Policy: ' + CSP,
  })

  const windowClosed = new Promise<void>(r => win.once('closed', r))
  return {
    offerPromise: offerPromise.then(offer => ({
      offer,
      /**
       * Must be called when the call is answered by the callee
       */
      onAnswer: (answer: string) => {
        webAppMessagePort.postMessage({ type: 'answer', answer })
      },
    })),
    windowClosed,
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
