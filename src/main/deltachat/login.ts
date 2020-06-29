import { DeltaChat } from 'deltachat-node'
import { app as rawApp } from 'electron'
import { getLogger } from '../../shared/logger'
import { setupMarkseenFix } from '../markseenFix'
import setupNotifications from '../notifications'
import setupUnreadBadgeCounter from '../unread-badge'
import SplitOut from './splitout'
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
    await dc.startIO()
    log.debug('Started IO')

    this._controller.emit('ready')
    // save last logged in account
    delete app.state.saved.credentials
    app.state.saved.lastAccount = accountDir

    log.info('dc_get_info', dc.getInfo())

    this._controller.accountDir = accountDir
    this._controller._dc = dc
    this._controller.credentials = credentials

    this.updateDeviceChats()

    setupNotifications(this._controller, (app as any).state.saved)
    setupUnreadBadgeCounter(this._controller)
    setupMarkseenFix(this._controller)
    this._controller.ready = true
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
    app.state.saved.lastAccount = null
    app.saveState()

    log.info('Logged out')
    this._controller._resetState()
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
      'changelog-version-1.4.2-2',
      `Changes in v1.4

⚡ We upgraded our core to async, which made it even faster
🤫 Psssst! You can now mute chats and take a break to foucs on things that really matter
🔍 Looking for a specific message? Our search now supports searching through messages, contacts & chats
🔥 Don't want to keep old messages on your device or server? Check out the new autodelete setting
🌑 We finally added a Darkmode
💅 Besides this, DeltaChat Desktop should look and feel better at various places, including settings & login

Full changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#142---2020-06-26` as any
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
    const savedCredentials = app.state.saved.credentials
    let selectedAccount: DeltaChatAccount | null = null
    const lastAccount = app.state.saved.lastAccount
    if (typeof lastAccount === 'string' && lastAccount.length >= 1) {
      selectedAccount = app.state.logins.find(
        account => account.path === lastAccount
      )
      if (!selectedAccount) {
        log.error(
          'Previous account not found!',
          app.state.saved.lastAccount,
          'is not in the list of found logins:',
          app.state.logins
        )
      }
    } else if (
      savedCredentials &&
      typeof savedCredentials === 'object' &&
      Object.keys(savedCredentials).length !== 0
    ) {
      // (fallback to old system)
      // if we find saved credentials we login in with these
      // which will create a new Deltachat instance which
      // is bound to a certain account
      selectedAccount = app.state.logins.find(
        account => account.addr === savedCredentials.addr
      )

      if (!selectedAccount) {
        log.warn(
          'Previous account not found!',
          app.state.saved.credentials,
          'is not in the list of found logins:',
          app.state.logins
        )
      }
    }
    return selectedAccount
  }
}
