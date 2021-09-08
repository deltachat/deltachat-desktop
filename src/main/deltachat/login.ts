import { C } from 'deltachat-node'
import { app as rawApp } from 'electron'
import { getLogger } from '../../shared/logger'
import { setupMarkseenFix } from '../markseenFix'
import setupNotifications from '../notifications'
import setupUnreadBadgeCounter from '../unread-badge'
import SplitOut from './splitout'
import { Credentials, DeltaChatAccount } from '../../shared/shared-types'
import { ExtendedAppMainProcess } from '../types'
import { stat, readdir } from 'fs/promises'
import { join } from 'path'
import { Context } from 'deltachat-node/dist/context'
const log = getLogger('main/deltachat/login')

const app = rawApp as ExtendedAppMainProcess

function setCoreStrings(dc: Context, strings: { [key: number]: string }) {
  Object.keys(strings).forEach(key => {
    dc.setStockTranslation(Number(key), strings[Number(key)])
  })
}

export default class DCLoginController extends SplitOut {
  /**
   * Called when this controller is created and when current
   * locale changes
   */
  _setCoreStrings(strings: { [key: number]: string }) {
    if (!this.controller.selectedAccountContext) return
    setCoreStrings(this.controller.selectedAccountContext, strings)
  }

  async selectAccount(accountId: number) {
    log.debug('selectAccount', accountId)
    this.controller.selectedAccountId = accountId
    this.controller.selectedAccountContext = this.accounts.accountContext(
      accountId
    )

    log.info('Ready, starting io...')
    this.controller.selectedAccountContext.startIO()
    log.debug('Started IO')

    this.controller.emit('ready')
    app.state.saved.lastAccount = accountId

    log.info('dc_get_info', this.selectedAccountContext.getInfo())

    this.updateDeviceChats()

    setupNotifications(this.controller, (app as any).state.saved)
    setupUnreadBadgeCounter(this.controller)
    setupMarkseenFix(this.controller)
    this.controller.ready = true
    return true
  }

  async updateCredentials(credentials: Credentials): Promise<void> {
    this.selectedAccountContext.stopIO()
    try {
      await this.selectedAccountContext.configure(credentials)
    } catch (err) {
      if (this.selectedAccountContext.isConfigured()) {
        this.selectedAccountContext.startIO()
      }
      throw err
    }
    this.selectedAccountContext.startIO()
  }

  logout() {
    app.state.saved.lastAccount = null
    app.saveState()

    log.info('Logged out')

    if (typeof this.controller._sendStateToRenderer === 'function')
      this.controller._sendStateToRenderer()
  }

  async addAccount(): Promise<number> {
    const accountId = this.accounts.addAccount()
    return accountId
  }

  async removeAccount(accountId: number) {
    this.accounts.removeAccount(accountId)
  }

  async getFreshMessageCounter(accountId: number) {
    const accountContext = this.accounts.accountContext(accountId)
    return accountContext.getFreshMessages().length
  }

  close() {
    this.controller.emit('DESKTOP_CLEAR_ALL_NOTIFICATIONS')
    if (!this.accounts) return
    this.accounts.stopIO()
    this.controller.unregisterEventHandler(this.accounts)
    this.accounts.close()
    this.controller.account_manager = null
  }

  updateDeviceChats() {
    this.controller.hintUpdateIfNessesary()

    this.selectedAccountContext.addDeviceMessage(
      'changelog-version-1.20_part1_0',
      `Improved e-mail compatibility in version 1.20:
📫 Read mailing lists
📭 Read HTML-mails
📪 Nice handling of support addresses
✒️💭 Read Signatures of your Contacts and use yours to express yourself, share your status or your Bio.
📞 experimental video chat can now be used in groups
🔧 Bug fixes and stability improvements.
[Full Change log](https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#12000---2021-03-22)` as any
    )

    this.selectedAccountContext.addDeviceMessage(
      'changelog-version-1.20_part2_0',
      `With this release we are reaching out to early adopters who are willing to face some challenges and want to help bring a convenient automatically end-to-end encrypting e-mail app to all platforms. It's about time, isn't it?
And don't worry .... Delta Chat also remains a decentralized messenger with the largest addressable user base ;)
💡 We welcome your feedback and suggestions in our forum:
https://support.delta.chat/
ℹ️ You can find more information about this release in our blog post about it:
https://delta.chat/en/2021-05-05-email-compat` as any
    )
  }

  async accountInfo(accountId: number): Promise<DeltaChatAccount> {
    const accountContext = this.accounts.accountContext(accountId)

    if (accountContext.isConfigured()) {
      const selfContact = accountContext.getContact(C.DC_CONTACT_ID_SELF)
      const [display_name, addr, profile_image, color] = [
        accountContext.getConfig('displayname'),
        accountContext.getConfig('addr'),
        selfContact.getProfileImage(),
        selfContact.color,
      ]
      return {
        type: 'configured',
        id: accountId,
        display_name,
        addr,
        profile_image,
        color,
      }
    } else {
      return {
        type: 'unconfigured',
        id: accountId,
      }
    }
  }

  async getAccountSize(accountId: number): Promise<number> {
    const accountContext = this.accounts.accountContext(accountId)
    return await _getAccountSize(join(accountContext.getBlobdir(), '..'))
  }

  getAllAccountIds(): number[] {
    return super.accounts.accounts()
  }

  async getAllAccounts(): Promise<DeltaChatAccount[]> {
    const accountIds: number[] = super.accounts.accounts()

    const accounts: DeltaChatAccount[] = new Array(accountIds.length)

    for (let i = 0; i < accountIds.length; i++) {
      accounts[i] = await this.accountInfo(accountIds[i])
    }

    return accounts
  }

  async getLastLoggedInAccount() {
    return app.state.saved.lastAccount
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
  strings[C.DC_STR_CANTDECRYPT_MSG_BODY] = tx('systemmsg_cannot_decrypt')
  strings[C.DC_STR_READRCPT] = tx('systemmsg_read_receipt_subject')
  strings[C.DC_STR_READRCPT_MAILBODY] = tx('systemmsg_read_receipt_body')
  strings[C.DC_STR_MSGGRPIMGDELETED] = tx('systemmsg_group_image_deleted')
  strings[C.DC_STR_E2E_PREFERRED] = tx('autocrypt_prefer_e2ee')
  strings[C.DC_STR_ARCHIVEDCHATS] = tx('chat_archived_chats_title')
  strings[C.DC_STR_AC_SETUP_MSG_SUBJECT] = tx('autocrypt_asm_subject')
  strings[C.DC_STR_AC_SETUP_MSG_BODY] = tx('autocrypt_asm_general_body')
  strings[C.DC_STR_CANNOT_LOGIN] = tx('login_error_cannot_login')
  strings[C.DC_STR_DEVICE_MESSAGES] = tx('device_talk')
  strings[C.DC_STR_SAVED_MESSAGES] = tx('saved_messages')
  strings[C.DC_STR_CONTACT_VERIFIED] = tx('contact_verified')
  strings[C.DC_STR_CONTACT_NOT_VERIFIED] = tx('contact_not_verified')
  strings[C.DC_STR_CONTACT_SETUP_CHANGED] = tx('contact_setup_changed')
  strings[C.DC_STR_MSGACTIONBYUSER] = tx('systemmsg_action_by_user')
  strings[C.DC_STR_MSGACTIONBYME] = tx('systemmsg_action_by_me')
  strings[C.DC_STR_DEVICE_MESSAGES_HINT] = tx('device_talk_explain')
  strings[C.DC_STR_WELCOME_MESSAGE] = tx('device_talk_welcome_message')
  strings[C.DC_STR_UNKNOWN_SENDER_FOR_CHAT] = tx(
    'systemmsg_unknown_sender_for_chat'
  )
  strings[C.DC_STR_SUBJECT_FOR_NEW_CONTACT] = tx(
    'systemmsg_subject_for_new_contact'
  )
  strings[C.DC_STR_FAILED_SENDING_TO] = tx('systemmsg_failed_sending_to')
  strings[C.DC_STR_EPHEMERAL_DISABLED] = tx(
    'systemmsg_ephemeral_timer_disabled'
  )
  strings[C.DC_STR_EPHEMERAL_SECONDS] = tx('systemmsg_ephemeral_timer_enabled')
  strings[C.DC_STR_EPHEMERAL_MINUTE] = tx('systemmsg_ephemeral_timer_minute')
  strings[C.DC_STR_EPHEMERAL_HOUR] = tx('systemmsg_ephemeral_timer_hour')
  strings[C.DC_STR_EPHEMERAL_DAY] = tx('systemmsg_ephemeral_timer_day')
  strings[C.DC_STR_EPHEMERAL_WEEK] = tx('systemmsg_ephemeral_timer_week')
  strings[C.DC_STR_EPHEMERAL_FOUR_WEEKS] = tx(
    'systemmsg_ephemeral_timer_four_weeks'
  )
  strings[C.DC_STR_VIDEOCHAT_INVITATION] = tx('videochat_invitation')
  strings[C.DC_STR_VIDEOCHAT_INVITE_MSG_BODY] = tx('videochat_invitation_body')
  strings[C.DC_STR_CONFIGURATION_FAILED] = tx('configuration_failed_with_error')
  strings[C.DC_STR_PROTECTION_ENABLED] = tx('systemmsg_chat_protection_enabled')
  strings[C.DC_STR_PROTECTION_DISABLED] = tx(
    'systemmsg_chat_protection_disabled'
  )
  strings[C.DC_STR_REPLY_NOUN] = tx('reply_noun')
  strings[C.DC_STR_FORWARDED] = tx('forwarded')

  return strings
}

async function _getAccountSize(path: string) {
  try {
    const db_size = (await stat(join(path, 'dc.db'))).size
    const blob_dir = join(path, 'dc.db-blobs')
    const blob_files = await readdir(blob_dir)
    let blob_size = 0
    if (blob_files.length > 0) {
      const blob_file_sizes = await Promise.all(
        blob_files.map(
          async blob_file => (await stat(join(blob_dir, blob_file))).size
        )
      )
      blob_size = blob_file_sizes.reduce(
        (totalSize, currentBlobSize) => totalSize + currentBlobSize
      )
    }

    return db_size + blob_size
  } catch (error) {
    log.warn(error)
    return 0
  }
}
