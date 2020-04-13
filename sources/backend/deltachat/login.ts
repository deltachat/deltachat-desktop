import { DeltaChat } from 'deltachat-node'
import { app } from 'electron'
import * as logger from '../../shared/logger'
import { setupMarkseenFix } from '../markseenFix'
import setupNotifications from '../notifications'
import setupUnreadBadgeCounter from '../unread-badge'
import SplitOut from './splitout'
import DeltaChatController from './controller'
import { Credentials } from '../../shared/shared-types'
const log = logger.getLogger('main/deltachat/login')

export interface credential_config extends Credentials {
  mail_security?: string
  send_security?: string
  mail_pw?: string
  [key: string]: string
}

export default class DCLoginController extends SplitOut {
  /**
   * Called when this controller is created and when current
   * locale changes
   */
  setCoreStrings(strings: { [key: number]: string }) {
    if (!this._dc) return

    Object.keys(strings).forEach(key => {
      this._dc.setStockTranslation(Number(key), strings[Number(key)])
    })

    this._controller._sendStateToRenderer()
  }

  login(
    accountDir: string,
    credentials: credential_config,
    sendStateToRenderer: typeof DeltaChatController.prototype._sendStateToRenderer,
    coreStrings: Parameters<
      typeof DCLoginController.prototype.setCoreStrings
    >[0],
    updateConfiguration = false
  ) {
    // Creates a separate DB file for each login
    this._controller.accountDir = accountDir
    log.info(`Using deltachat instance ${this._controller.accountDir}`)
    const dc = new DeltaChat()
    this._controller._dc = dc
    this._controller.credentials = credentials
    this._controller._sendStateToRenderer = sendStateToRenderer

    if (!DeltaChat.maybeValidAddr(credentials.addr)) {
      this._controller.emit(
        'error',
        this._controller.translate('bad_email_address')
      )
      return
    }

    this._dc.open(this._controller.accountDir, (err: any) => {
      if (err) throw err
      this.setCoreStrings(coreStrings)
      const onReady = () => {
        log.info('Ready')
        this._controller.ready = true
        this._controller.configuring = false
        this._controller.emit('ready', this._controller.credentials)
        log.info('dc_get_info', dc.getInfo())
        this.updateDeviceChats()
        sendStateToRenderer()
      }
      if (!this._dc.isConfigured() || updateConfiguration) {
        this._dc.once('ready', onReady)
        this._controller.configuring = true
        this._dc.configure(this.addServerFlags(credentials), undefined)
        sendStateToRenderer()
      } else {
        onReady()
      }
    })
    this._controller.registerEventHandler(dc)
    setupNotifications(this._controller, (app as any).state.saved)
    setupUnreadBadgeCounter(this._controller)
    setupMarkseenFix(this._controller)
  }

  logout() {
    this.close()
    this._controller._resetState()

    log.info('Logged out')
    this._controller.emit('logout')
    if (typeof this._controller._sendStateToRenderer === 'function')
      this._controller._sendStateToRenderer()
  }

  configure(
    credentials: any,
    cb: Parameters<typeof DeltaChat.prototype.configure>[1]
  ) {
    this._controller.configuring = true
    this._dc.configure(this.addServerFlags(credentials), cb)
  }

  close() {
    if (!this._dc) return
    this._dc.close()
    this._controller._dc = null
  }

  addServerFlags(credentials: any) {
    return Object.assign({}, credentials, {
      server_flags: this._controller.settings.serverFlags(credentials),
    })
  }

  updateDeviceChats() {
    this._dc.updateDeviceChats()
    this._dc.addDeviceMessage(
      'changelog-version-1.0.0-4',
      `Changes in v1.0.0

We are happy to announce version 1.0.0 release of DeltaChat Desktop! 🎉This release includes traffic reductions, better performance, user experience improvements and bug fixes. Besides this, new users will be warned about providers which are known to make trouble with DeltaChat and get better & smaller cryptographic keys.

- sending of messages is now faster and more reliable
- only messages that are displayed get downloaded
- new button to open one-on-one chats
- you can start multiple DeltaChat instances if you start it with the "--multiple-instances" argument (be careful with this one, don't use the same account in multiple instances!)
- performance improvements on chat scrolling
- restyle of various menus
- many bug fixes
- new users will get informed if their provider is known to need special care to run seamless with DeltaChat
- new users will use Ed25519 keys (shorter & better cryptographic keys)

Full changelog: https://delta.chat/a3e/
    ` as any
    ),
      this._dc.addDeviceMessage(
        'changelog-version-1.1.0-0',
        `Changes in v1.1.0

- Add an zoom🔍 option in order to adjust interface and font size. (It's found under View -> Zoom Factor)
- some interface bug fixes
- fixed encrypting to Ed25519 keys (there was a bug that broke encrypting to people with Ed25519 keys)

Full changelog: https://delta.chat/f32/
    ` as any
      )
  }
}
