import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import '../notifications'
import SplitOut from './splitout'
import { DeltaChatAccount } from '../../shared/shared-types'
import { stat, readdir } from 'fs/promises'
import { join } from 'path'
import { Context } from 'deltachat-node/node/dist/context'
import { DesktopSettings } from '../desktop_settings'
import { tx } from '../load-translations'
const log = getLogger('main/deltachat/login')

function setCoreStrings(
  dc: Readonly<Context>,
  strings: { [key: number]: string }
) {
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
    if (!this.controller._inner_selectedAccountContext) {
      return
    }
    setCoreStrings(this.controller.selectedAccountContext, strings)
  }

  async selectAccount(accountId: number) {
    log.debug('selectAccount', accountId)
    this.controller.selectedAccountId = accountId
    if (this.controller._inner_selectedAccountContext) {
      this.controller.selectedAccountContext.unref()
    }
    this.controller._inner_selectedAccountContext = this.accounts.accountContext(
      accountId
    )
    log.debug('Set core translations')
    this.controller.login._setCoreStrings(txCoreStrings())

    log.info('Ready, starting io...')
    this.controller.selectedAccountContext.startIO()
    log.debug('Started IO')

    this.controller.emit('ready')
    DesktopSettings.update({ lastAccount: accountId })

    log.info('dc_get_info', this.selectedAccountContext.getInfo())

    this.updateDeviceChats()

    this.controller.ready = true
    return true
  }

  logout() {
    DesktopSettings.update({ lastAccount: undefined })

    if (!DesktopSettings.state.syncAllAccounts) {
      this.selectedAccountContext.stopIO()
    }
    if (this.controller._inner_selectedAccountContext) {
      this.controller.selectedAccountContext.unref()
    }
    this.controller.selectedAccountId = null
    this.controller._inner_selectedAccountContext = null

    log.info('Logged out')
  }

  close() {
    this.controller.webxdc._closeAll()
    if (!this.accounts) return
    this.accounts.stopIO()
    this.controller.unregisterEventHandler(this.accounts)
    this.accounts.close()
    this.controller._inner_account_manager = null
  }

  updateDeviceChats() {
    this.controller.hintUpdateIfNessesary()

    this.selectedAccountContext.addDeviceMessage(
      'changelog-version-1.32.0-version0',
      `What's new in 1.32.0?
2️⃣ New experimental features: Broadcast lists and Automated Email Address Porting
➕ Floating action button in chatlist to start a new chat
🚆 Many reliability improvements and bugfixes

Full changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1310---2022-07-17`
    )
  }

  async _accountInfo(accountId: number): Promise<DeltaChatAccount> {
    const accountContext = this.accounts.accountContext(accountId)

    if (accountContext.isConfigured()) {
      const selfContact = accountContext.getContact(C.DC_CONTACT_ID_SELF)
      if (!selfContact) {
        log.error('selfContact is undefined')
      }
      const [display_name, addr, profile_image, color] = [
        accountContext.getConfig('displayname'),
        accountContext.getConfig('addr'),
        selfContact?.getProfileImage() || '',
        selfContact?.color || 'red',
      ]
      accountContext.unref()
      return {
        type: 'configured',
        id: accountId,
        display_name,
        addr,
        profile_image,
        color,
      }
    } else {
      accountContext.unref()
      return {
        type: 'unconfigured',
        id: accountId,
      }
    }
  }
}

export function txCoreStrings() {
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
  // strings[C.DC_STR_E2E_AVAILABLE] = tx('DC_STR_E2E_AVAILABLE')
  // strings[C.DC_STR_ENCR_TRANSP] = tx('DC_STR_ENCR_TRANSP')
  // strings[C.DC_STR_ENCR_NONE] = tx('DC_STR_ENCR_NONE')
  strings[C.DC_STR_FINGERPRINTS] = tx('qrscan_fingerprint_label')
  strings[C.DC_STR_CANTDECRYPT_MSG_BODY] = tx('systemmsg_cannot_decrypt')
  strings[C.DC_STR_READRCPT] = tx('systemmsg_read_receipt_subject')
  strings[C.DC_STR_READRCPT_MAILBODY] = tx('systemmsg_read_receipt_body')
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
  strings[C.DC_STR_DEVICE_MESSAGES_HINT] = tx('device_talk_explain')
  strings[C.DC_STR_WELCOME_MESSAGE] = tx('device_talk_welcome_message')
  strings[C.DC_STR_UNKNOWN_SENDER_FOR_CHAT] = tx(
    'systemmsg_unknown_sender_for_chat'
  )
  strings[C.DC_STR_SUBJECT_FOR_NEW_CONTACT] = tx(
    'systemmsg_subject_for_new_contact'
  )
  strings[C.DC_STR_FAILED_SENDING_TO] = tx('systemmsg_failed_sending_to')
  strings[C.DC_STR_VIDEOCHAT_INVITATION] = tx('videochat_invitation')
  strings[C.DC_STR_VIDEOCHAT_INVITE_MSG_BODY] = tx('videochat_invitation_body')
  strings[C.DC_STR_CONFIGURATION_FAILED] = tx('configuration_failed_with_error')
  strings[C.DC_STR_REPLY_NOUN] = tx('reply_noun')
  strings[C.DC_STR_FORWARDED] = tx('forwarded')

  //strings[C.DC_STR_MSGLOCATIONENABLED] = tx('')
  //strings[C.DC_STR_MSGLOCATIONDISABLED] = tx('')
  strings[C.DC_STR_LOCATION] = tx('location')
  strings[C.DC_STR_STICKER] = tx('sticker')
  strings[C.DC_STR_BAD_TIME_MSG_BODY] = tx('devicemsg_bad_time')
  strings[C.DC_STR_UPDATE_REMINDER_MSG_BODY] = tx('devicemsg_update_reminder')
  //strings[C.DC_STR_ERROR_NO_NETWORK] = tx('')
  strings[C.DC_STR_SELF_DELETED_MSG_BODY] = tx('devicemsg_self_deleted')
  //strings[C.DC_STR_SERVER_TURNED_OFF] = tx('')
  strings[C.DC_STR_QUOTA_EXCEEDING_MSG_BODY] = tx('devicemsg_storage_exceeding')
  strings[C.DC_STR_PARTIAL_DOWNLOAD_MSG_BODY] = tx('n_bytes_message')
  strings[C.DC_STR_DOWNLOAD_AVAILABILITY] = tx('download_max_available_until')
  //strings[C.DC_STR_SYNC_MSG_SUBJECT] = tx('')
  //strings[C.DC_STR_SYNC_MSG_BODY] = tx('')
  strings[C.DC_STR_INCOMING_MESSAGES] = tx('incoming_messages')
  strings[C.DC_STR_OUTGOING_MESSAGES] = tx('outgoing_messages')
  strings[C.DC_STR_STORAGE_ON_DOMAIN] = tx('storage_on_domain')
  strings[C.DC_STR_ONE_MOMENT] = tx('one_moment')
  strings[C.DC_STR_CONNECTED] = tx('connectivity_connected')
  strings[C.DC_STR_CONNTECTING] = tx('connectivity_connecting')
  strings[C.DC_STR_UPDATING] = tx('connectivity_updating')
  strings[C.DC_STR_SENDING] = tx('sending')
  strings[C.DC_STR_LAST_MSG_SENT_SUCCESSFULLY] = tx(
    'last_msg_sent_successfully'
  )
  strings[C.DC_STR_ERROR] = tx('error_x')
  strings[C.DC_STR_NOT_SUPPORTED_BY_PROVIDER] = tx('not_supported_by_provider')
  strings[C.DC_STR_MESSAGES] = tx('messages')
  strings[C.DC_STR_BROADCAST_LIST] = tx('broadcast_list')
  strings[C.DC_STR_PART_OF_TOTAL_USED] = tx('part_of_total_used')
  strings[C.DC_STR_SECURE_JOIN_STARTED] = tx('secure_join_started')
  strings[C.DC_STR_SECURE_JOIN_REPLIES] = tx('secure_join_replies')
  strings[C.DC_STR_SETUP_CONTACT_QR_DESC] = tx('qrshow_join_contact_hint')
  strings[C.DC_STR_SECURE_JOIN_GROUP_QR_DESC] = tx('qrshow_join_group_hint')
  strings[C.DC_STR_NOT_CONNECTED] = tx('connectivity_not_connected')
  strings[C.DC_STR_AEAP_ADDR_CHANGED] = tx('aeap_addr_changed')
  strings[C.DC_STR_AEAP_EXPLANATION_AND_LINK] = tx('aeap_explanation')

  strings[C.DC_STR_GROUP_NAME_CHANGED_BY_YOU] = tx('group_name_changed_by_you')
  strings[C.DC_STR_GROUP_NAME_CHANGED_BY_OTHER] = tx(
    'group_name_changed_by_other'
  )
  strings[C.DC_STR_GROUP_IMAGE_CHANGED_BY_YOU] = tx(
    'group_image_changed_by_you'
  )
  strings[C.DC_STR_GROUP_IMAGE_CHANGED_BY_OTHER] = tx(
    'group_image_changed_by_other'
  )
  strings[C.DC_STR_ADD_MEMBER_BY_YOU] = tx('add_member_by_you')
  strings[C.DC_STR_ADD_MEMBER_BY_OTHER] = tx('add_member_by_other')
  strings[C.DC_STR_REMOVE_MEMBER_BY_YOU] = tx('remove_member_by_you')
  strings[C.DC_STR_REMOVE_MEMBER_BY_OTHER] = tx('remove_member_by_other')
  strings[C.DC_STR_GROUP_LEFT_BY_YOU] = tx('group_left_by_you')
  strings[C.DC_STR_GROUP_LEFT_BY_OTHER] = tx('group_left_by_other')
  strings[C.DC_STR_GROUP_IMAGE_DELETED_BY_YOU] = tx(
    'group_image_deleted_by_you'
  )
  strings[C.DC_STR_GROUP_IMAGE_DELETED_BY_OTHER] = tx(
    'group_image_deleted_by_other'
  )
  strings[C.DC_STR_LOCATION_ENABLED_BY_YOU] = tx('location_enabled_by_you')
  strings[C.DC_STR_LOCATION_ENABLED_BY_OTHER] = tx('location_enabled_by_other')
  strings[C.DC_STR_EPHEMERAL_TIMER_DISABLED_BY_YOU] = tx(
    'ephemeral_timer_disabled_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_DISABLED_BY_OTHER] = tx(
    'ephemeral_timer_disabled_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_SECONDS_BY_YOU] = tx(
    'ephemeral_timer_seconds_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_SECONDS_BY_OTHER] = tx(
    'ephemeral_timer_seconds_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_MINUTE_BY_YOU] = tx(
    'ephemeral_timer_1_minute_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_MINUTE_BY_OTHER] = tx(
    'ephemeral_timer_1_minute_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_HOUR_BY_YOU] = tx(
    'ephemeral_timer_1_hour_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_HOUR_BY_OTHER] = tx(
    'ephemeral_timer_1_hour_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_DAY_BY_YOU] = tx(
    'ephemeral_timer_1_day_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_DAY_BY_OTHER] = tx(
    'ephemeral_timer_1_day_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_WEEK_BY_YOU] = tx(
    'ephemeral_timer_1_week_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_1_WEEK_BY_OTHER] = tx(
    'ephemeral_timer_1_week_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_MINUTES_BY_YOU] = tx(
    'ephemeral_timer_minutes_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_MINUTES_BY_OTHER] = tx(
    'ephemeral_timer_minutes_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_HOURS_BY_YOU] = tx(
    'ephemeral_timer_hours_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_HOURS_BY_OTHER] = tx(
    'ephemeral_timer_hours_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_DAYS_BY_YOU] = tx(
    'ephemeral_timer_days_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_DAYS_BY_OTHER] = tx(
    'ephemeral_timer_days_by_other'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_WEEKS_BY_YOU] = tx(
    'ephemeral_timer_weeks_by_you'
  )
  strings[C.DC_STR_EPHEMERAL_TIMER_WEEKS_BY_OTHER] = tx(
    'ephemeral_timer_weeks_by_other'
  )
  strings[C.DC_STR_PROTECTION_ENABLED_BY_YOU] = tx('protection_enabled_by_you')
  strings[C.DC_STR_PROTECTION_ENABLED_BY_OTHER] = tx(
    'protection_enabled_by_other'
  )
  strings[C.DC_STR_PROTECTION_DISABLED_BY_YOU] = tx(
    'protection_disabled_by_you'
  )
  strings[C.DC_STR_PROTECTION_DISABLED_BY_OTHER] = tx(
    'protection_disabled_by_other'
  )

  return strings
}
