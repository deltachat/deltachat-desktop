import { DeltaChat, C } from 'deltachat-node'
import { app as rawApp } from 'electron'
import { getLogger } from '../../shared/logger'
import { setupMarkseenFix } from '../markseenFix'
import setupNotifications from '../notifications'
import setupUnreadBadgeCounter from '../unread-badge'
import SplitOut from './splitout'
import { Credentials, DeltaChatAccount } from '../../shared/shared-types'
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
    if (this._controller._dc) {
      log.info('already logged in, logging out first')
      await this.logout()
    }
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

  async newLogin(credentials: Credentials): Promise<DeltaChatAccount> {
    const newAccountPath = getNewAccountPath()
    await this.login(newAccountPath, credentials)
    const logins = await this.getLogins()

    return logins.find(account => account.path === newAccountPath)
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
      'changelog-version-1.13.0-4',
      `Changes in 1.13

🔥 Disappearing messages are now stable 
📷 Overhaul QR scanning dialog
👫 Overhaul account overview and welcome screen
👀 You now find the close dialog button in the dialog footer for a more consistent experience
👻 Fixed a bug where some chats were not loaded besides many other improvements and bug fixes!

[Full Changelog](https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#11300---2020-10-01)` as any
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

export function txCoreStrings() {
  const tx = app.translate
  const strings: { [key: number]: string } = {}
  // TODO: Check if we need the uncommented core translations
  strings[C.DC_STR_NOMESSAGES] = tx('chat_no_messages')
  strings[C.DC_STR_SELF] = tx('self')
  strings[C.DC_STR_DRAFT] = tx('draft')
  strings[C.DC_STR_VOICEMESSAGE] = tx('voice_message')
  strings[C.DC_STR_DEADDROP] = tx('login_inbox')
  strings[C.DC_STR_IMAGE] = tx('image')
  strings[C.DC_STR_GIF] = tx('gif')
  strings[C.DC_STR_VIDEO] = tx('video')
  strings[C.DC_STR_AUDIO] = tx('audio')
  strings[C.DC_STR_FILE] = tx('file')
  strings[C.DC_STR_ENCRYPTEDMSG] = tx('encrypted_message')
  strings[C.DC_STR_STATUSLINE] = tx('pref_default_status_text')
  strings[C.DC_STR_NEWGROUPDRAFT] = tx('group_hello_draft')
  strings[C.DC_STR_MSGGRPNAME] = tx('systemmsg_group_name_changed')
  strings[C.DC_STR_MSGGRPIMGCHANGED] = tx('systemmsg_group_image_changed')
  strings[C.DC_STR_MSGADDMEMBER] = tx('systemmsg_member_added')
  strings[C.DC_STR_MSGDELMEMBER] = tx('systemmsg_member_removed')
  strings[C.DC_STR_MSGGROUPLEFT] = tx('systemmsg_group_left')
  // strings[C.DC_STR_E2E_AVAILABLE] = tx('DC_STR_E2E_AVAILABLE')
  // strings[C.DC_STR_ENCR_TRANSP] = tx('DC_STR_ENCR_TRANSP')
  // strings[C.DC_STR_ENCR_NONE] = tx('DC_STR_ENCR_NONE')
  strings[C.DC_STR_FINGERPRINTS] = tx('qrscan_fingerprint_label')
  strings[C.DC_STR_READRCPT] = tx('systemmsg_read_receipt_subject')
  strings[C.DC_STR_READRCPT_MAILBODY] = tx('systemmsg_read_receipt_body')
  strings[C.DC_STR_MSGGRPIMGDELETED] = tx('systemmsg_group_image_deleted')
  strings[C.DC_STR_E2E_PREFERRED] = tx('autocrypt_prefer_e2ee')
  strings[C.DC_STR_ARCHIVEDCHATS] = tx('chat_archived_chats_title')
  // strings[C.DC_STR_STARREDMSGS] = tx('DC_STR_STARREDMSGS')
  strings[C.DC_STR_AC_SETUP_MSG_SUBJECT] = tx('autocrypt_asm_subject')
  strings[C.DC_STR_AC_SETUP_MSG_BODY] = tx('autocrypt_asm_general_body')
  strings[C.DC_STR_CANTDECRYPT_MSG_BODY] = tx('systemmsg_cannot_decrypt')
  strings[C.DC_STR_CANNOT_LOGIN] = tx('login_error_cannot_login')
  strings[C.DC_STR_SERVER_RESPONSE] = tx('login_error_server_response')
  strings[68] = tx('device_talk')
  strings[69] = tx('saved_messages')

  return strings
}
