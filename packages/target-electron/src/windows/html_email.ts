import electron, {
  BrowserWindow,
  dialog,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  nativeTheme,
  session,
  shell,
  WebContents,
  WebContentsView,
} from 'electron'
import { clipboard } from 'electron/common'
import { join } from 'path'
import { platform } from 'os'

import { appIcon, htmlDistDir } from '../application-constants.js'
import { DesktopSettings } from '../desktop_settings.js'
import { isInviteLink, truncateText } from '@deltachat-desktop/shared/util.js'
import { tx } from '../load-translations.js'
import { open_url } from '../open_url.js'
import { loadTheme } from '../themes.js'
import { getDCJsonrpcRemote } from '../ipc.js'
import { getLogger } from '../../../shared/logger.js'

import * as mainWindow from './main.js'
import {
  getAppMenu,
  getFileMenu,
  getHelpMenu,
  refresh as refreshTitleMenu,
} from '../menu.js'
import { initMinWinDimensionHandling } from './helpers.js'
import { setContentProtection } from '../content-protection.js'

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
  account_id: number,
  message_id: number,
  isContactRequest: boolean,
  subject: string,
  from: string,
  receiveTime: string,
  htmlEmail: string
) {
  const window_id = `${account_id}.${message_id}`
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

  const mainWindowZoomFactor =
    mainWindow.window?.webContents.getZoomFactor() || 1.0

  const window = (open_windows[window_id] = new electron.BrowserWindow({
    backgroundColor: '#282828',
    // backgroundThrottling: false, // do not throttle animations/timers when page is background
    darkTheme: true, // Forces dark theme (GTK+3)
    icon: appIcon(),
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
  window.webContents.setZoomFactor(mainWindowZoomFactor)

  setContentProtection(window)

  const removeScreenChangeListeners = initMinWinDimensionHandling(
    window,
    400,
    300
  )

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
    } catch (_error) {
      /* ignore error */
    }
  })

  window.webContents.ipc.handle(
    'get-theme',
    async () => (await loadTheme(DesktopSettings.state.activeTheme)).data
  )

  window.webContents.on('will-navigate', (e: electron.Event, _url: string) => {
    // Prevent drag-and-drop from navigating the Electron window, which can happen
    // before our drag-and-drop handlers have been initialized.
    e.preventDefault()
  })

  window.once('ready-to-show', () => {
    window.show()
  })

  window.on('close', () => {
    context_menu_handle?.()
    delete open_windows[window_id]
    removeScreenChangeListeners()
  })

  const isMac = platform() === 'darwin'

  // copied and adapted from webxdc menu
  // TODO: would make sense to refactor these menus at some point
  const makeMenu = () => {
    return Menu.buildFromTemplate([
      ...(isMac ? [getAppMenu(window)] : []),
      getFileMenu(window, isMac),
      {
        label: tx('global_menu_edit_desktop'),
        submenu: [
          {
            label: tx('global_menu_edit_copy_desktop'),
            role: 'copy',
          },
          {
            label: tx('menu_select_all'),
            click: () => {
              sandboxedView.webContents.focus()
              sandboxedView.webContents.selectAll()
            },
            accelerator: isMac ? 'Cmd+A' : 'Ctrl+A',
          },
        ],
      },
      {
        label: tx('global_menu_view_desktop'),
        submenu: [
          {
            accelerator: 'CmdOrCtrl+=',
            label: tx('menu_zoom_in'),
            role: 'zoomIn',
          },
          {
            accelerator: 'CmdOrCtrl+-',
            label: tx('menu_zoom_out'),
            role: 'zoomOut',
          },
          {
            accelerator: 'CmdOrCtrl+0',
            label: `${tx('reset')}`,
            role: 'resetZoom',
          },
          { type: 'separator' },
          {
            label: tx('global_menu_view_floatontop_desktop'),
            type: 'checkbox',
            checked: window.isAlwaysOnTop(),
            click: () => {
              window.setAlwaysOnTop(!window.isAlwaysOnTop())
              if (platform() !== 'darwin') {
                window.setMenu(makeMenu())
              } else {
                // change to window menu
                Menu.setApplicationMenu(makeMenu())
              }
            },
          },
          { role: 'togglefullscreen' },
        ],
      },
      getHelpMenu(isMac),
    ])
  }

  if (!isMac) {
    window.setMenu(makeMenu())
  }

  window.on('focus', () => {
    if (isMac) {
      // change to email menu
      Menu.setApplicationMenu(makeMenu())
    }
  })
  window.on('blur', () => {
    if (isMac) {
      // change back to main-window menu
      refreshTitleMenu()
    }
  })

  /**
   * the actual content of the email is loaded into a sandboxed view
   * with its own session and webPreferences that allows to load remote
   * content, but only if the user allows it
   */
  let sandboxedView: WebContentsView = makeBrowserView(
    account_id,
    loadRemoteContentAtStart,
    htmlEmail,
    window
  )
  window.contentView.addChildView(sandboxedView)
  sandboxedView.webContents.setZoomFactor(
    mainWindowZoomFactor * Math.pow(1.2, window.webContents.getZoomLevel())
  )
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
          const newValue =
            !DesktopSettings.state.HTMLEmailAlwaysLoadRemoteContent
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
            HTMLEmailAskForRemoteLoadingConfirmation:
              !DesktopSettings.state.HTMLEmailAskForRemoteLoadingConfirmation,
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
      const contentZoomFactor =
        mainWindowZoomFactor * Math.pow(1.2, window.webContents.getZoomLevel())
      const windowZoomFactor = window.webContents.getZoomFactor()

      const window_bounds = window.getBounds()
      const content_size = window.getContentSize()
      const new_w = bounds.width * windowZoomFactor
      const new_h = bounds.height * windowZoomFactor
      const new_y = content_size[1] - new_h

      sandboxedView?.setBounds({
        x: bounds.x,
        y: new_y,
        width: new_w,
        height: new_h,
      })
      sandboxedView?.webContents.setZoomFactor(contentZoomFactor)
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
    window.contentView.removeChildView(sandboxedView)
    context_menu_handle()
    sandboxedView.webContents.close()
    sandboxedView = makeBrowserView(
      account_id,
      allow_network,
      htmlEmail,
      window
    )
    window.contentView.addChildView(sandboxedView)
    context_menu_handle = createContextMenu(window, sandboxedView.webContents)
    if (bounds) sandboxedView.setBounds(bounds)

    // for debugging email
    // sandboxedView.webContents.openDevTools({ mode: 'detach' })
  }
  // handle toggle network button
  window.webContents.ipc.handle('html-view:change-network', update_restrictions)

  window.loadFile(
    join(
      htmlDistDir(),
      'electron_html_email_view/electron_html_email_view.html'
    )
  )

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
script-src 'none';`.replace(/\n/g, '')
const CSP_ALLOW = `
default-src 'none';
font-src 'self' data: http: https:;
frame-src 'none';
img-src 'self' blob: data: https: http:;
media-src 'self' data: http: https:;
style-src 'self' 'unsafe-inline';
form-action 'none';
script-src 'none';
`.replace(/\n/g, '')

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
    ses.protocol.handle('http', () => {
      return new Response('', { status: 404 })
    })
    ses.protocol.handle('https', () => {
      return new Response('', { status: 404 })
    })
  }

  ses.protocol.handle('email', () => {
    return new Response(Buffer.from(html_content), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'Content-Security-Policy': allow_remote_content ? CSP_ALLOW : CSP_DENY,
      },
    })
  })

  if (allow_remote_content) {
    const callback = async (req: Request) => {
      try {
        const response = await getDCJsonrpcRemote().rpc.getHttpResponse(
          account_id,
          req.url
        )
        const blob = Buffer.from(response.blob, 'base64')
        return new Response(blob, {
          status: 200,
          headers: {
            'Content-Security-Policy': CSP_ALLOW,
            'Content-Type': `${response.mimetype}; ${response.encoding}`,
          },
        })
      } catch (error) {
        log.info('remote content failed to load', req.url, error)
        return new Response(Buffer.from((error as any)?.message), {
          status: 400,
          headers: {
            mimeType: 'text/plain',
          },
        })
      }
    }

    ses.protocol.handle('http', callback)
    ses.protocol.handle('https', callback)
  }

  const sandboxedView = new WebContentsView({
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
    if (url.startsWith('mailto:') || isInviteLink(url)) {
      open_url(url)
      mainWindow.window?.show()
    } else {
      if (
        url.toLowerCase().startsWith('http:') ||
        url.toLowerCase().startsWith('https:')
      ) {
        shell.openExternal(url)
      } else {
        dialog
          .showMessageBox(window, {
            buttons: [tx('no'), tx('menu_copy_link_to_clipboard')],
            message: tx('ask_copy_unopenable_link_to_clipboard', url),
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
      const prefix = 'email://index.html'
      if (url.startsWith(prefix)) {
        let urlWithoutPrefix = url.slice(prefix.length)
        if (url.slice(prefix.length)[0] == '/') {
          urlWithoutPrefix = urlWithoutPrefix.slice(1)
        }
        if (urlWithoutPrefix.startsWith('#')) {
          // double fragment issue workaround
          // the issue is that when clicking on the same anchor multiple times,
          // only the first time it jumps to it - the times after it just appends it to the url without jumping,
          // might be an issue in electopn/chromium
          // like this `email://index.html#anchor#anchor`
          const lastFragment = urlWithoutPrefix.split('#').reverse()[0]
          sandboxedView.webContents
            .loadURL(`email://index.html/${Math.random()}/#${lastFragment}`)
            .catch(log.error.bind(log, 'error'))
          return
        } else {
          // assume it is a https weblink
          return openLink('https://' + urlWithoutPrefix)
        }
      }
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
    _event: any,
    props: Electron.ContextMenuParams
  ) => {
    const { editFlags } = props
    const hasText = props.selectionText.trim().length > 0

    const menuItems = []

    if (props.isEditable || hasText) {
      menuItems.push(
        new MenuItem({
          id: 'copy',
          label: tx('global_menu_edit_copy_desktop'),
          enabled: editFlags.canCopy && hasText,
          click() {
            if (webContents) {
              webContents.copy()
            } else {
              electron.clipboard.writeText(props.selectionText)
            }
          },
        })
      )
    }

    if (props.mediaType === 'image') {
      if (menuItems.length) {
        menuItems.push(new MenuItem({ type: 'separator' }))
      }

      menuItems.push(
        new MenuItem({
          id: 'copyImage',
          label: tx('menu_copy_image_to_clipboard'),
          click() {
            webContents.copyImageAt(props.x, props.y)
          },
        })
      )
    }

    if (props.linkURL.length !== 0 && props.mediaType === 'none') {
      if (menuItems.length) {
        menuItems.push(new MenuItem({ type: 'separator' }))
      }

      menuItems.push(
        new MenuItem({
          id: 'copyLink',
          label: tx('menu_copy_link_to_clipboard'),
          click() {
            electron.clipboard.write({
              bookmark: props.linkText,
              text: props.linkURL,
            })
          },
        })
      )
    }

    if (menuItems.length) {
      const menu = electron.Menu.buildFromTemplate(menuItems)

      menu.popup({ window: win })
    }
  }
  webContents.on('context-menu', handleContextMenu)
  return () => {
    if (win.isDestroyed()) {
      return
    }
    webContents.removeListener('context-menu', handleContextMenu)
  }
}
