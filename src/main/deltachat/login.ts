import { DeltaChat } from 'deltachat-node'
import { app } from 'electron'
import { getLogger } from '../../shared/logger'
import { setupMarkseenFix } from '../markseenFix'
import setupNotifications from '../notifications'
import setupUnreadBadgeCounter from '../unread-badge'
import SplitOut from './splitout'
import DeltaChatController from './controller'
import { Credentials } from '../../shared/shared-types'
import { txCoreStrings } from '../ipc'
import { getNewAccountPath } from '../logins'
const log = getLogger('main/deltachat/login')

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

  async login(
    accountDir: string,
    credentials: Credentials,
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
      throw new Error(this._controller.translate('bad_email_address'))
    }

    this._controller.registerEventHandler(dc)

    await this._dc.open(this._controller.accountDir)

    this.setCoreStrings(coreStrings)
    const onReady = async () => {
      log.info('Ready, starting io...')
      this._dc.startIO()
      log.debug('Started IO')

      this._controller.ready = true
      this._controller.configuring = false
      this._controller.emit('ready', this._controller.credentials)
      log.info('dc_get_info', dc.getInfo())
      this.updateDeviceChats()
      sendStateToRenderer()
    }

    if (!this._dc.isConfigured() || updateConfiguration) {
      this._controller.configuring = true
      try {
        await this.configure(this.addServerFlags(credentials))
      } catch (err) {
        // Ignore error, we catch it anyways in frontend
      }
    }

    onReady()

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

  async newLogin(credentials: Credentials) {
    console.log(credentials)
    await this.login(
      getNewAccountPath(),
      credentials,
      () => {},
      txCoreStrings()
    )
  }

  async configure(credentials: Credentials) {
    try {
      await this._dc.configure(credentials)
    } catch (err) {
      // ignore and handle in frontend
    }
  }

  close() {
    if (!this._dc) return
    this._dc.stopIO()
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
    this._controller.hintUpdateIfNessesary()
    this._dc.addDeviceMessage(
      'changelog-version-1.3.0-1',
      `Changes in v1.3.0

- QR codes can now be scanned from desktop as you know it from Android/iOS. Try
  it out by clicking on Menu -> Scan QR code. Besides using any available webcam,
  you can also scan a qr code by importing a picture of it. This way we can 
  finally join verified groups from desktop!
- Support for openpgp4fpr urls. They allow you to do the same things as with qr
  codes, but the information is baked into an url. Wanna try it out? Try to
  login to our support forum (https://support.delta.chat) with DeltaChat and the
  "Manual link" option :)
- You can now pin chats. This will make sure they stay on the top of your list
  of chats.
- It's now possible to change the name of a contact in the same way as it's with
  changing the name of a group.

Full changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#130---2020-04-30
    ` as any
    )
  }
}
