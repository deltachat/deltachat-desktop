import { DeltaChat } from 'deltachat-node'
import { app as rawApp } from 'electron'
import { getLogger } from '../../shared/logger'
import { setupMarkseenFix } from '../markseenFix'
import setupNotifications from '../notifications'
import setupUnreadBadgeCounter from '../unread-badge'
import SplitOut from './splitout'
import DeltaChatController from './controller'
import { Credentials, DeltaChatAccount } from '../../shared/shared-types'
import { txCoreStrings } from '../ipc'
import { getNewAccountPath, getLogins, removeAccount } from '../logins'
import { ExtendedAppMainProcess } from '../types'
import { serverFlags } from './settings'
const log = getLogger('main/deltachat/login')

const app = rawApp as ExtendedAppMainProcess

function setCoreStrings(dc: any, strings: { [key: number]: string }) {
  Object.keys(strings).forEach(key => {
    dc.setStockTranslation(Number(key), strings[Number(key)])
  })
}

function addServerFlags(credentials: any) {
  return Object.assign({}, credentials, {
    server_flags: serverFlags(credentials),
  })
}

export default class DCLoginController extends SplitOut {
  /**
   * Called when this controller is created and when current
   * locale changes
   */
  setCoreStrings(strings: { [key: number]: string }) {
    if (!this._dc) return
    setCoreStrings(this._dc, strings)
  }

  async login(
    accountDir: string,
    credentials: Credentials,
    updateConfiguration = false
  ) {
    log.info(`Using deltachat instance ${this._controller.accountDir}`)
    const dc = new DeltaChat()

    if (!DeltaChat.maybeValidAddr(credentials.addr)) {
      throw new Error(this._controller.translate('bad_email_address'))
    }

    this._controller.registerEventHandler(dc)

    await dc.open(accountDir)

    setCoreStrings(dc, txCoreStrings())

    this._controller._dc = dc
    if (!dc.isConfigured() || updateConfiguration) {
      try {
        await dc.configure(addServerFlags(credentials))
      } catch (err) {
        this._controller.unregisterEventHandler(dc)
        await dc.close()
        this._controller._dc = null
        return false
      }
    }

    log.info('Ready, starting io...')
    dc.startIO()
    log.debug('Started IO')

    this._controller.emit('ready', credentials)
    log.info('dc_get_info', dc.getInfo())

    this._controller.accountDir = accountDir
    this._controller._dc = dc
    this._controller.credentials = credentials

    this.updateDeviceChats()

    setupNotifications(this._controller, (app as any).state.saved)
    setupUnreadBadgeCounter(this._controller)
    setupMarkseenFix(this._controller)
    return true
  }

  async updateCredentials(credentials: Credentials): Promise<boolean> {
    await this._dc.stopIO()
    try {
      await this._dc.configure(addServerFlags(credentials))
    } catch (err) {
      await this._dc.startIO()
      return false
    }
    await this._dc.startIO()
    return true
  }

  logout() {
    this.close()
    this._controller._resetState()

    app.state.saved.credentials = null
    app.saveState()

    log.info('Logged out')
    this._controller.emit('logout')
    if (typeof this._controller._sendStateToRenderer === 'function')
      this._controller._sendStateToRenderer()
  }

  async newLogin(credentials: Credentials) {
    await this.login(getNewAccountPath(), credentials)
  }

  close() {
    if (!this._dc) return
    this._dc.stopIO()
    this._controller.unregisterEventHandler(this._dc)
    this._dc.close()
    this._controller._dc = null
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

  async getLogins() {
    return await getLogins()
  }

  async loadAccount(login: DeltaChatAccount) {
    return await this.login(login.path, { addr: login.addr })
  }

  async forgetAccount(login: DeltaChatAccount) {
    try {
      await removeAccount(login.path)
      this._controller.sendToRenderer('success', 'successfully forgot account')
    } catch (error) {
      this._controller.sendToRenderer('error', error.message)
    }
  }

  async getLastLoggedInAccount() {
    // if we find saved credentials we login in with these
    // which will create a new Deltachat instance which
    // is bound to a certain account
    const savedCredentials = app.state.saved.credentials
    if (
      savedCredentials &&
      typeof savedCredentials === 'object' &&
      Object.keys(savedCredentials).length !== 0
    ) {
      const selectedAccount = app.state.logins.find(
        account => account.addr === savedCredentials.addr
      )

      if (selectedAccount) {
        return selectedAccount
      }

      log.error(
        'Previous account not found!',
        app.state.saved.credentials,
        'is not in the list of found logins:',
        app.state.logins
      )
      return null
    }
    return null
  }
}
