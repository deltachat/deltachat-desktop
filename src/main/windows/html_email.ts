import electron, {
  BrowserView,
  BrowserWindow,
  dialog,
  MenuItemConstructorOptions,
  nativeTheme,
  session,
  shell,
  WebContents,
} from 'electron'
import { appIcon, htmlDistDir } from '../application-constants'
import { join } from 'path'
import { DesktopSettings } from '../desktop_settings'
import { truncateText } from '../../shared/util'
import { tx } from '../load-translations'
import { open_url } from '../open_url'
import { loadTheme } from '../themes'
import { getDCJsonrpcClient } from '../ipc'
import { getLogger } from '../../shared/logger'
import { clipboard } from 'electron/common'
import * as mainWindow from './main'

const log = getLogger('html_email')

const open_windows: { [window_id: string]: BrowserWindow } = {}

/**
 *
 * @param window_id that we know if it's already open, should be accountid+"-"+msgid
 * @param isContactRequest
 * @param subject
 * @param from
 * @param receiveTime
 * @param htmlEmail
 */
export function openHtmlEmailWindow(
  window_id: string,
  account_id: number,
  isContactRequest: boolean,
  subject: string,
  from: string,
  receiveTime: string,
  htmlEmail: string
) {
  if (open_windows[window_id]) {
    // window already exists, focus it
    open_windows[window_id].focus()
    return
  }
  const initialBounds = DesktopSettings.state.HTMLEmailWindowBounds || {
    height: 621,
    width: 800,
    x: undefined,
    y: undefined,
  }

  const window = (open_windows[window_id] = new electron.BrowserWindow({
    backgroundColor: '#282828',
    // backgroundThrottling: false, // do not throttle animations/timers when page is background
    darkTheme: true, // Forces dark theme (GTK+3)
    icon: appIcon(),
    minHeight: 300,
    minWidth: 400,
    show: false,
    title: `${truncateText(subject, 42)} – ${truncateText(from, 40)}`,
    height: initialBounds.height,
    width: initialBounds.width,
    x: initialBounds.x,
    y: initialBounds.y,
    webPreferences: {
      nodeIntegration: false,
      preload: join(
        htmlDistDir(),
        'electron_html_email_view/electron_html_email_view_preload.js'
      ),
      spellcheck: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      contextIsolation: true,
    },
    alwaysOnTop: mainWindow?.isAlwaysOnTop(),
  }))
  window.webContents.setZoomFactor(DesktopSettings.state.zoomFactor)

  const loadRemoteContentAtStart =
    DesktopSettings.state.HTMLEmailAlwaysLoadRemoteContent && !isContactRequest

  window.webContents.ipc.handle('html_email:get_info', _ => ({
    subject,
    from,
    receiveTime,
    networkButtonLabelText: tx('load_remote_content'),
    toggle_network: loadRemoteContentAtStart,
  }))

  nativeTheme.on('updated', () => {
    try {
      window.webContents.ipc.emit('theme-update')
    } catch (error) {
      /* ignore error */
    }
  })

  window.webContents.ipc.handle(
    'get-theme',
    async () => (await loadTheme(DesktopSettings.state.activeTheme)).data
  )

  window.loadFile(
    join(
      htmlDistDir(),
      'electron_html_email_view/electron_html_email_view.html'
    )
  )

  window.webContents.on('will-navigate', (e: electron.Event, _url: string) => {
    // Prevent drag-and-drop from navigating the Electron window, which can happen
    // before our drag-and-drop handlers have been initialized.
    e.preventDefault()
  })

  window.once('ready-to-show', () => {
    window.show()
  })

  window.once('focus', () => {
    window.webContents.setZoomFactor(DesktopSettings.state.zoomFactor)
  })
  window.on('close', () => {
    context_menu_handle?.()
    delete open_windows[window_id]
  })

  let sandboxedView: BrowserView = makeBrowserView(
    account_id,
    loadRemoteContentAtStart,
    htmlEmail,
    window
  )
  window.setBrowserView(sandboxedView)
  let context_menu_handle = createContextMenu(window, sandboxedView.webContents)

  window.webContents.ipc.handle('html-view:more-menu', (_ev, { x, y }) => {
    const menuItems: {
      [key: string]: () => MenuItemConstructorOptions
    } = {
      separator: () => ({ type: 'separator' }),
      always_show: () => ({
        id: 'always_show',
        type: 'checkbox',
        label: tx('always_load_remote_images'),
        checked: DesktopSettings.state.HTMLEmailAlwaysLoadRemoteContent,
        click() {
          const newValue = !DesktopSettings.state
            .HTMLEmailAlwaysLoadRemoteContent
          DesktopSettings.update({
            HTMLEmailAlwaysLoadRemoteContent: newValue,
          })
          // apply change
          update_restrictions(null, newValue, true)
          window.webContents.executeJavaScript(
            `document.getElementById('toggle_network').checked = window.network_enabled= ${Boolean(
              newValue
            )}`
          )
        },
      }),
      dont_ask: () => ({
        id: 'show_warning',
        type: 'checkbox',
        label: tx('show_warning'),
        checked: DesktopSettings.state.HTMLEmailAskForRemoteLoadingConfirmation,
        click() {
          DesktopSettings.update({
            HTMLEmailAskForRemoteLoadingConfirmation: !DesktopSettings.state
              .HTMLEmailAskForRemoteLoadingConfirmation,
          })
        },
      }),
    }
    let menu: Electron.Menu
    if (isContactRequest) {
      menu = electron.Menu.buildFromTemplate([menuItems.dont_ask()])
    } else {
      menu = electron.Menu.buildFromTemplate([
        menuItems.always_show(),
        menuItems.dont_ask(),
      ])
    }
    menu.popup({ window, x, y })
  })

  window.webContents.ipc.handle(
    'html-view:resize-content',
    (_ev, bounds: Electron.Rectangle) => {
      const window_bounds = window.getBounds()
      const new_y = Math.floor(window_bounds.height - bounds.height)
      sandboxedView?.setBounds({
        ...bounds,
        y: new_y,
      })
      DesktopSettings.update({ HTMLEmailWindowBounds: window_bounds })
    }
  )
  window.on('moved', () => {
    const window_bounds = window.getBounds()
    DesktopSettings.update({ HTMLEmailWindowBounds: window_bounds })
  })

  const update_restrictions = async (
    _ev: any,
    allow_network: boolean,
    skip_sideeffects = false
  ) => {
    if (
      !skip_sideeffects &&
      !isContactRequest &&
      !allow_network &&
      DesktopSettings.state.HTMLEmailAlwaysLoadRemoteContent
    ) {
      // revert always loading when turning the toggle switch
      DesktopSettings.update({
        HTMLEmailAlwaysLoadRemoteContent: false,
      })
    }

    if (
      !skip_sideeffects &&
      allow_network &&
      DesktopSettings.state.HTMLEmailAskForRemoteLoadingConfirmation
    ) {
      const buttons = [
        {
          label: tx('no'),
          action: () => {
            throw new Error('user denied')
          },
        },
        { label: tx('yes'), action: () => {} },
        // isContactRequest || {
        //   label: tx('pref_html_always_load_remote_content'),
        //   action: () => {
        //     DesktopSettings.update({
        //       HTMLEmailAlwaysLoadRemoteContent: true,
        //     })
        //   },
        // },
      ].filter(item => typeof item === 'object') as {
        label: string
        action: () => void
      }[]

      const result = await dialog.showMessageBox(window, {
        message: tx('load_remote_content_ask'),
        buttons: buttons.map(b => b.label),
        type: 'none',
        icon: '',
        defaultId: 0,
        cancelId: 0,
      })
      buttons[result.response].action()
    }

    const bounds = sandboxedView?.getBounds()
    window.removeBrowserView(sandboxedView)
    context_menu_handle()
    sandboxedView.webContents.close()
    sandboxedView = makeBrowserView(
      account_id,
      allow_network,
      htmlEmail,
      window
    )
    window.setBrowserView(sandboxedView)
    context_menu_handle = createContextMenu(window, sandboxedView.webContents)
    if (bounds) sandboxedView.setBounds(bounds)

    // for debugging email
    // sandboxedView.webContents.openDevTools({ mode: 'detach' })
  }

  window.webContents.ipc.handle('html-view:change-network', update_restrictions)

  // for debugging wrapper
  // window.webContents.openDevTools({ mode: 'detach' })
}

const CSP_DENY = `default-src 'none';
font-src 'self' data:;
frame-src 'none';
img-src 'self' data:;
media-src 'self' data:;
style-src 'self' data: 'unsafe-inline';
form-action 'none';
script-src 'none';`
const CSP_ALLOW = `
default-src 'none';
font-src 'self' data: http: https:;
frame-src 'none';
img-src 'self' blob: data: https: http:;
media-src 'self' data: http: https:;
style-src 'self' 'unsafe-inline';
form-action 'none';
script-src 'none';
`

function makeBrowserView(
  account_id: number,
  allow_remote_content: boolean,
  html_content: string,
  window: BrowserWindow
) {
  const ses = session.fromPartition(`${Date.now()}`, { cache: false })

  ses.setProxy({ mode: 'fixed_servers', proxyRules: 'not-existing-proxy:80' })
  if (!allow_remote_content) {
    // block network access
    ses.protocol.interceptHttpProtocol('http', (_req, callback) => {
      callback({ statusCode: 404, data: '' })
    })
    ses.protocol.interceptHttpProtocol('https', (_req, callback) => {
      callback({ statusCode: 404, data: '' })
    })
  }

  ses.protocol.registerBufferProtocol('email', (_req, callback) => {
    callback({
      statusCode: 200,
      data: Buffer.from(html_content),
      mimeType: 'text/html',
      headers: {
        'Content-Security-Policy': allow_remote_content ? CSP_ALLOW : CSP_DENY,
      },
    })
  })

  if (allow_remote_content) {
    const callback = async (
      req: Electron.ProtocolRequest,
      callback: (response: Electron.ProtocolResponse) => void
    ) => {
      try {
        const response = await getDCJsonrpcClient().getHttpResponse(
          account_id,
          req.url
        )
        const blob = Buffer.from(response.blob, 'base64')
        callback({
          statusCode: 200,
          data: blob,
          headers: {
            'Content-Security-Policy': CSP_ALLOW,
            'Content-Type': `${response.mimetype}; ${response.encoding}`,
          },
        })
      } catch (error) {
        log.info('remote content failed to load', req.url, error)
        callback({
          statusCode: 400,
          data: Buffer.from((error as any)?.message),
          mimeType: 'text/plain',
        })
      }
    }

    ses.protocol.interceptBufferProtocol('http', callback)
    ses.protocol.interceptBufferProtocol('https', callback)
  }

  const sandboxedView = new BrowserView({
    webPreferences: {
      accessibleTitle: 'email content',
      contextIsolation: true,
      javascript: false,

      disableDialogs: true,
      webgl: false,
      sandbox: true,
      spellcheck: false,
      session: ses,
    },
  })

  sandboxedView.webContents.loadURL('email://index.html')
  sandboxedView.webContents.insertCSS(`:root {
      color: black;
      background-color: white;
    }`)

  const openLink = (url: string) => {
    if (url.startsWith('mailto:')) {
      open_url(url)
      mainWindow.window?.show()
    } else {
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url)
      } else {
        dialog
          .showMessageBox(window, {
            buttons: [tx('no'), tx('menu_copy_link_to_clipboard')],
            message: tx('desktop_offer_copy_non_web_link_to_clipboard', url),
          })
          .then(({ response }) => {
            if (response == 1) {
              clipboard.writeText(url)
            }
          })
      }
    }
  }

  sandboxedView.webContents.on(
    'will-navigate',
    (e: electron.Event, url: string) => {
      // Prevent drag-and-drop from navigating the Electron window, which can happen
      // before our drag-and-drop handlers have been initialized.
      // Also handle clicking links inside of the message.
      e.preventDefault()
      openLink(url)
    }
  )

  sandboxedView.webContents.setWindowOpenHandler(details => {
    openLink(details.url)
    return { action: 'deny' }
  })

  return sandboxedView
}

const createContextMenu = (win: BrowserWindow, webContents: WebContents) => {
  const handleContextMenu = (
    _event: Event,
    props: Electron.ContextMenuParams
  ) => {
    const { editFlags } = props
    const hasText = props.selectionText.trim().length > 0

    const defaultActions: {
      [key: string]: () => MenuItemConstructorOptions
    } = {
      separator: () => ({ type: 'separator' }),
      copy: () => ({
        id: 'copy',
        label: tx('global_menu_edit_copy_desktop'),
        enabled: editFlags.canCopy && hasText,
        visible: props.isEditable || hasText,
        click() {
          if (webContents) {
            webContents.copy()
          } else {
            electron.clipboard.writeText(props.selectionText)
          }
        },
      }),
      paste: () => ({
        id: 'paste',
        label: tx('global_menu_edit_paste_desktop'),
        enabled: editFlags.canPaste,
        visible: props.isEditable,
        click() {
          webContents.paste()
        },
      }),
      copyLink: () => ({
        id: 'copyLink',
        label: tx('menu_copy_link_to_clipboard'),
        visible: props.linkURL.length !== 0 && props.mediaType === 'none',
        click() {
          electron.clipboard.write({
            bookmark: props.linkText,
            text: props.linkURL,
          })
        },
      }),
      copyImage: () => ({
        id: 'copyImage',
        label: tx('menu_copy_image_to_clipboard'),
        visible: props.mediaType === 'image',
        click() {
          webContents.copyImageAt(props.x, props.y)
        },
      }),
    }

    const menu = electron.Menu.buildFromTemplate([
      defaultActions.copy(),
      defaultActions.separator(),
      defaultActions.copyImage(),
      defaultActions.separator(),
      defaultActions.copyLink(),
    ])
    menu.popup({ window: win })
  }
  webContents.on('context-menu', handleContextMenu)
  return () => {
    if (win.isDestroyed()) {
      return
    }
    webContents.removeListener('context-menu', handleContextMenu)
  }
}
