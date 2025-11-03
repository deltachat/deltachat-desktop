import escapeHTML from 'escape-html'
import {
  BrowserWindow,
  dialog,
  Menu,
  MessageChannelMain,
  net,
  session,
  // This is actually used in a JSDoc.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type protocol,
} from 'electron/main'
import { join } from 'path'
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import { appIcon, htmlDistDir } from '../application-constants'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { getDCJsonrpcRemote } from '../ipc'
import { pathToFileURL } from 'node:url'
import type { T } from '@deltachat/jsonrpc-client'
import { tx } from '../load-translations'

const log = getLogger('windows/video-call')

export function startOutgoingVideoCall(accountId: number, chatId: number) {
  log.info('starting outgoing video call', { accountId, chatId })

  const { offerPromise, windowClosed, closeWindow } = openVideoCallWindow(
    accountId,
    chatId,
    CallDirection.Outgoing,
    {}
  )

  const jsonrpcRemote = getDCJsonrpcRemote()

  const callHandledPromise = (async () => {
    const { offer, onAnswer } = await offerPromise
    if (offer == null) {
      log.info("calls-webapp didn't return an offer, aborting outgoing call")
      // We expect this code path to be taken
      // only if the window already got closed, but let's be defeinsive.
      closeWindow()
      return
    }
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

    return await done
  })()

  return callHandledPromise
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
    {
      chat_id,
      msg_id,
      place_call_info,
    }: { chat_id: number; msg_id: number; place_call_info: string }
  ) => {
    log.info('got IncomingCall event', eventAccountId, msg_id)

    openIncomingVideoCallWindow(
      eventAccountId,
      chat_id,
      msg_id,
      place_call_info
    )
  }

  jsonrpcRemote.on('IncomingCall', incomingCallListener)
  return () => jsonrpcRemote.off('IncomingCall', incomingCallListener)
}

function openIncomingVideoCallWindow(
  accountId: number,
  chatId: number,
  callMessageId: number,
  callerWebrtcOffer: string
) {
  log.info('received incoming call', { accountId, chatId, callMessageId })

  const { answerPromise, windowClosed, closeWindow } = openVideoCallWindow(
    accountId,
    chatId,
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
    if (answer == null) {
      log.info("calls-webapp didn't return an answer")
      // We expect this code path to be taken
      // only if the window already got closed, but let's be defeinsive.
      closeWindow()
      return
    }
    log.info('Call WebRTC answer generated, sending "accept call" message')
    jsonrpcRemote.rpc.acceptIncomingCall(accountId, callMessageId, answer)
    onCallAcceptedOnThisDevice()
  })()
}

const enum CallDirection {
  Incoming,
  Outgoing,
}

function openVideoCallWindow<D extends CallDirection>(
  accountId: number,
  chatId: number,
  callDirection: D,
  {
    callerWebrtcOffer,
  }: D extends CallDirection.Incoming
    ? {
        callerWebrtcOffer: string
      }
    : {
        callerWebrtcOffer?: undefined
      }
): {
  closeWindow: () => void
  windowClosed: Promise<void>
} & (D extends CallDirection.Incoming
  ? {
      /**
       * Resolves to `null` if the page port got closed,
       * which is only expected to happen when the page gets closed,
       * or on invalid message from the page.
       */
      answerPromise: Promise<null | string>
    }
  : {
      offerPromise: Promise<{
        /**
         * `null` if the page port got closed
         * which is only expected to happen when the page gets closed,
         * or on invalid message from the page.
         */
        offer: null | string
        /**
         * Must be called when the call is answered by the callee
         */
        onAnswer: (answer: string) => void
      }>
    }) {
  const jsonrpcRemote = getDCJsonrpcRemote()

  const chatInfoPromise = jsonrpcRemote.rpc.getBasicChatInfo(accountId, chatId)

  const ses = session.fromPartition('calls-webapp')

  if (!ses.protocol.isProtocolHandled(SCHEME_NAME)) {
    ses.protocol.handle(SCHEME_NAME, returnIndexHtmlOrAvatar)
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
    title: tx('start_call'), // To be changed later.
    icon: appIcon(), // To be changed later.
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

  const abortController = new AbortController()
  win.once('closed', () => abortController.abort('window closed'))

  chatInfoPromise.then(chat => {
    if (win.isDestroyed()) {
      return
    }
    // TODO i18n
    win.setTitle(`Call with ${chat.name}`)
    chat.profileImage && win.setIcon(chat.profileImage)
  })

  win.setMenu(
    Menu.buildFromTemplate([
      {
        label: tx('global_menu_view_desktop'),
        submenu: [
          { role: 'toggleDevTools' },

          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },

          { role: 'togglefullscreen' },
        ],
      },
    ])
  )

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

  jsonrpcRemote.rpc.iceServers(accountId).then((iceServersString: string) => {
    webAppMessagePort.postMessage({
      type: 'iceServers',
      iceServersString,
    })
  })

  /**
   * Whether to utilize the "Accept call?" prompt
   * that is provided inside the `calls-webapp` itself,
   * or use a native dialog instead.
   */
  const useBuiltinAcceptCallPrompt = true
  if (callerWebrtcOffer != undefined && !useBuiltinAcceptCallPrompt) {
    // const _assert: CallDirection.Incoming = callDirection
    ;(async () => {
      let chatInfo: null | T.BasicChat = null
      try {
        chatInfo = await chatInfoPromise
      } catch (error) {
        log.warn('Failed to get basic chat info', error)
      }

      const { response } = await dialog.showMessageBox(win, {
        // TODO i18n
        // TODO show the account name / label that received the call?
        message: chatInfo
          ? `📞 ${chatInfo.name} is calling`
          : `📞 ${tx('incoming_call')}`,
        type: 'question',
        buttons: ['Decline', 'Answer'],
        defaultId: 0,
        cancelId: 0,
        icon: chatInfo?.profileImage || undefined,
        signal: abortController.signal,
      })

      const answer = response === 1
      if (answer) {
        webAppMessagePort.postMessage({
          type: 'offer',
          offer: callerWebrtcOffer,
        })
      } else {
        win.close()
      }
    })()
  }

  /**
   * This is gonna be either an offer or an answer,
   * depending on {@linkcode callDirection}
   */
  const messageFromPagePromise = new Promise<string | null>(r => {
    webAppMessagePort.once('message', e => {
      if (typeof e.data !== 'string') {
        log.error('Invalid message type from calls-webapp window', e.data)
        r(null)
        return
      }
      r(e.data)
    })
    webAppMessagePort.once('close', () => {
      log.info('calls-webapp page port closed')
      r(null)
    })
  })
  webAppMessagePort.start()

  const host = formatHost(accountId, chatId)
  const query = callDirection === CallDirection.Incoming ? '?playRingtone' : ''
  const hash =
    callDirection === CallDirection.Outgoing
      ? '' // We'll `#startCall` after a "grace period" below.
      : useBuiltinAcceptCallPrompt
        ? `#offerIncomingCall=${btoa(callerWebrtcOffer!)}`
        : // Otherwise we'll set the hash later, when the call gets accepted.
          ''
  win.webContents.loadURL(`${SCHEME_NAME}://${host}${query}${hash}`, {
    extraHeaders: 'Content-Security-Policy: ' + CSP,
  })

  if (callDirection === CallDirection.Outgoing) {
    // Do not `#startCall` immediately. Give the user a moment to cancel it
    // before it starts ringing.
    // Note that after we actually `#startCall`,
    // the offer will be generated almost immediately,
    // because the app is "warmed up" (e.g. see `iceCandidatePoolSize`).
    // So basically this sets a minimum delay, rather than an extra delay.
    setTimeout(() => {
      if (abortController.signal.aborted) {
        return
      }
      webAppMessagePort.postMessage({ type: 'startCall' })
    }, 1500)
  }

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
      // `closeWindow` doesn't always actually close the window,
      // so let's also directly abort here,
      // instead of waiting for 'closed' event.
      abortController.abort('closeWindow called')

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
// font-src is needed for Eruda (debug) build and should be removed
// when the "calls" feature goes to production. See
// https://github.com/deltachat/deltachat-desktop/issues/5547.
const CSP =
  "default-src 'none';\
style-src 'self' 'unsafe-inline';\
script-src 'self' 'unsafe-inline';\
img-src 'self';\
font-src data:;\
media-src 'self'"

async function returnIndexHtmlOrAvatar(request: GlobalRequest) {
  const url = URL.parse(request.url)
  if (url == null) {
    return makeResponse('', { status: 400 })
  }

  if (!isOriginGood(request.url)) {
    return makeResponse('', { status: 401 })
  }

  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === ''
  ) {
    const res = await net.fetch(
      pathToFileURL(
        join(htmlDistDir(), 'calls-webapp', 'index.html')
      ).toString()
    )
    return makeResponse(res.body)
  }

  if (url.pathname === '/avatar') {
    const parsedHost = parseHost(url.host)
    if (parsedHost == null) {
      return makeResponse('', { status: 400 })
    }

    const jsonrpcRemote = getDCJsonrpcRemote()
    const chat = await jsonrpcRemote.rpc.getBasicChatInfo(
      parsedHost.accountId,
      parsedHost.chatId
    )
    if (chat.profileImage == null || chat.profileImage == '') {
      const initial = avatarInitial(chat.name)
      // Style (font size, etc) are mostly copy-pasted from `.avatar`
      // (in `_avatar.scss`).
      // TODO: the fonts are copy-pasted from the main window
      // (`--fonts-default`), but they can't be loaded in SVG. See
      // https://github.com/deltachat/deltachat-desktop/pull/5546#issuecomment-3418636124.
      return makeResponse(
        `<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <style>
              @font-face { 
                font-family: 'EmojiMart'; 
                src: local('Apple Color Emoji'), url("noto/emoji/NotoColorEmoji.ttf") format("truetype"); 
              } 
            </style>
            <rect width="48" height="48" fill="${escapeHTML(chat.color)}"/>
            <text
              x="50%"
              y="50%"
              dominant-baseline="central"
              text-anchor="middle"
              font-size="26"
              font-family="Roboto, 'EmojiMart', 'Apple Color Emoji', NotoEmoji, 'Helvetica Neue', Arial, Helvetica, NotoMono, sans-serif"
              fill="#fff"
            >
              ${escapeHTML(initial)}
            </text>
          </svg>`,
        undefined,
        'image/svg+xml'
      )
    }
    const res = await net.fetch(pathToFileURL(chat.profileImage).toString())
    return makeResponse(
      res.body,
      undefined,
      res.headers.get('Content-Type') ?? undefined
    )
  }

  if (url.pathname === '/ringtone') {
    const res = await net.fetch(
      pathToFileURL(
        join(htmlDistDir(), 'audio', 'ringtone-afro-nigeria-short.opus')
      ).toString()
    )
    return makeResponse(
      res.body,
      undefined,
      res.headers.get('Content-Type') ?? undefined
    )
  }

  return makeResponse('', { status: 404 })
}
// Copy-pasted from webxdc.ts
function makeResponse(
  body: ConstructorParameters<typeof Response>[0],
  responseInit?: Omit<ResponseInit, 'headers'>,
  mimeType?: string
) {
  const headers = new Headers({
    'Content-Security-Policy': CSP,
  })
  if (mimeType != undefined) {
    headers.append('content-type', mimeType)
  }

  return new Response(body, {
    ...responseInit,
    headers,
  })
}

const SCHEME_NAME = 'calls-webapp-scheme'

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
    parseHost(urlParsed.host) != null &&
    urlParsed.port === ''
  )
}

type ChatId = number
type AccountId = number
function formatHost(
  accountId: number,
  chatId: number
): `${ChatId}.${AccountId}.calls-webapp-dummy-host` {
  return `${chatId}.${accountId}.calls-webapp-dummy-host`
}
/**
 * @see {@linkcode formatHost}.
 * @returns `null` if the host is invalid.
 */
function parseHost(host: string): null | {
  accountId: number
  chatId: number
} {
  const [chatIdStr, accountIdStr, dummyHostName, ...rest] = host.split('.')
  const [chatId, accountId] = [parseInt(chatIdStr), parseInt(accountIdStr)]
  const isValidId = (num: number) => Number.isFinite(num) && num >= 0
  if (!isValidId(accountId) || !isValidId(chatId)) {
    return null
  }
  if (rest.length !== 0) {
    return null
  }
  if (dummyHostName !== 'calls-webapp-dummy-host') {
    return null
  }
  return {
    accountId,
    chatId,
  }
}

/**
 * To be passed to {@linkcode protocol.registerSchemesAsPrivileged}.
 */
export const callsWebappElectronScheme = {
  scheme: SCHEME_NAME,
  privileges: {
    // Needed for `getUserMedia`.
    secure: true,

    // Needed for videos to work.
    stream: true,
    standard: true,
  },
}
