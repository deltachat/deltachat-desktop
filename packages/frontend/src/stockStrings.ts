import { C } from '@deltachat/jsonrpc-client'

import { getLogger } from '../../shared/logger'
import { BackendRemote } from './backend-com'

const log = getLogger('renderer/stockstrings')

type DC_STR_Keys = keyof typeof C & `DC_STR_${string}`
type StockStrings = {
  [P in DC_STR_Keys as (typeof C)[P]]: string
}

export async function updateCoreStrings() {
  log.info('loading core translations')
  const tx = window.static_translate

  type StockStringsSomeOmited = Omit<
    StockStrings,
    | C.DC_STR_E2E_AVAILABLE
    | C.DC_STR_ENCR_TRANSP
    | C.DC_STR_ENCR_NONE
    | C.DC_STR_MSGLOCATIONENABLED
    | C.DC_STR_MSGLOCATIONDISABLED
    | C.DC_STR_ERROR_NO_NETWORK
    | C.DC_STR_SERVER_TURNED_OFF
    | C.DC_STR_SYNC_MSG_SUBJECT
    | C.DC_STR_SYNC_MSG_BODY

    // Deprecated, see
    // https://github.com/chatmail/core/blob/main/deltachat-ffi/deltachat.h
    | C.DC_STR_MSGGRPNAME
    | C.DC_STR_MSGGRPIMGCHANGED
    | C.DC_STR_MSGADDMEMBER
    | C.DC_STR_MSGDELMEMBER
    | C.DC_STR_MSGGROUPLEFT
    | C.DC_STR_ENCRYPTEDMSG
    | C.DC_STR_ENCR_TRANSP
    | C.DC_STR_READRCPT
    | C.DC_STR_READRCPT_MAILBODY
    | C.DC_STR_MSGGRPIMGDELETED
    | C.DC_STR_E2E_PREFERRED
    | C.DC_STR_CONTACT_NOT_VERIFIED
    | C.DC_STR_CONTACT_SETUP_CHANGED
    | C.DC_STR_AC_SETUP_MSG_SUBJECT
    | C.DC_STR_AC_SETUP_MSG_BODY
    | C.DC_STR_MSGACTIONBYUSER
    | C.DC_STR_MSGACTIONBYME
    // | C.DC_STR_UNKNOWN_SENDER_FOR_CHAT
    | C.DC_STR_EPHEMERAL_DISABLED
    | C.DC_STR_EPHEMERAL_SECONDS
    | C.DC_STR_EPHEMERAL_MINUTE
    | C.DC_STR_EPHEMERAL_HOUR
    | C.DC_STR_EPHEMERAL_DAY
    | C.DC_STR_EPHEMERAL_WEEK
    | C.DC_STR_EPHEMERAL_FOUR_WEEKS
    | C.DC_STR_EPHEMERAL_MINUTES
    | C.DC_STR_EPHEMERAL_HOURS
    | C.DC_STR_EPHEMERAL_DAYS
    | C.DC_STR_EPHEMERAL_WEEKS
    // | C.DC_STR_ONE_MOMENT
    | C.DC_STR_AEAP_ADDR_CHANGED
    | C.DC_STR_CHAT_PROTECTION_DISABLED
    | C.DC_STR_SECUREJOIN_WAIT_TIMEOUT
    | C.DC_STR_SECUREJOIN_TAKES_LONGER
    | C.DC_STR_CONTACT
  >
  const strings: StockStringsSomeOmited = {
    // TODO: Check if we need the uncommented core translations
    [C.DC_STR_NOMESSAGES]: tx('chat_no_messages'),
    [C.DC_STR_SELF]: tx('self'),
    [C.DC_STR_DRAFT]: tx('draft'),
    [C.DC_STR_VOICEMESSAGE]: tx('voice_message'),
    [C.DC_STR_IMAGE]: tx('image'),
    [C.DC_STR_GIF]: tx('gif'),
    [C.DC_STR_VIDEO]: tx('video'),
    [C.DC_STR_AUDIO]: tx('audio'),
    [C.DC_STR_FILE]: tx('file'),
    // [C.DC_STR_E2E_AVAILABLE]: tx('DC_STR_E2E_AVAILABLE'),
    // [C.DC_STR_ENCR_TRANSP]: tx('DC_STR_ENCR_TRANSP'),
    // [C.DC_STR_ENCR_NONE]: tx('DC_STR_ENCR_NONE'),
    [C.DC_STR_FINGERPRINTS]: tx('qrscan_fingerprint_label'),
    [C.DC_STR_CANTDECRYPT_MSG_BODY]: tx('systemmsg_cannot_decrypt'),
    [C.DC_STR_ARCHIVEDCHATS]: tx('chat_archived_chats_title'),
    [C.DC_STR_CANNOT_LOGIN]: tx('login_error_cannot_login'),
    [C.DC_STR_DEVICE_MESSAGES]: tx('device_talk'),
    [C.DC_STR_NEW_GROUP_SEND_FIRST_MESSAGE]: tx('chat_new_group_hint'),
    [C.DC_STR_SAVED_MESSAGES]: tx('saved_messages'),
    [C.DC_STR_CONTACT_VERIFIED]: tx('contact_verified'),
    [C.DC_STR_DEVICE_MESSAGES_HINT]: tx('device_talk_explain'),
    [C.DC_STR_WELCOME_MESSAGE]: tx('device_talk_welcome_message2'),
    [C.DC_STR_UNKNOWN_SENDER_FOR_CHAT]: tx('systemmsg_unknown_sender_for_chat'),
    [C.DC_STR_SUBJECT_FOR_NEW_CONTACT]: tx('systemmsg_subject_for_new_contact'),
    [C.DC_STR_FAILED_SENDING_TO]: tx('systemmsg_failed_sending_to'),
    [C.DC_STR_VIDEOCHAT_INVITATION]: tx('videochat_invitation'),
    [C.DC_STR_VIDEOCHAT_INVITE_MSG_BODY]: tx('videochat_invitation_body'),
    [C.DC_STR_CONFIGURATION_FAILED]: tx('configuration_failed_with_error'),
    [C.DC_STR_REPLY_NOUN]: tx('reply_noun'),
    [C.DC_STR_FORWARDED]: tx('forwarded'),
    //[C.DC_STR_MSGLOCATIONENABLED]: tx(''),
    //[C.DC_STR_MSGLOCATIONDISABLED]: tx(''),
    [C.DC_STR_LOCATION]: tx('location'),
    [C.DC_STR_STICKER]: tx('sticker'),
    [C.DC_STR_BAD_TIME_MSG_BODY]: tx('devicemsg_bad_time'),
    [C.DC_STR_UPDATE_REMINDER_MSG_BODY]: tx('devicemsg_update_reminder'),
    //[C.DC_STR_ERROR_NO_NETWORK]: tx(''),
    [C.DC_STR_SELF_DELETED_MSG_BODY]: tx('devicemsg_self_deleted'),
    //[C.DC_STR_SERVER_TURNED_OFF]: tx(''),
    [C.DC_STR_QUOTA_EXCEEDING_MSG_BODY]: tx('devicemsg_storage_exceeding'),
    [C.DC_STR_PARTIAL_DOWNLOAD_MSG_BODY]: tx('n_bytes_message'),
    [C.DC_STR_DOWNLOAD_AVAILABILITY]: tx('download_max_available_until'),
    //[C.DC_STR_SYNC_MSG_SUBJECT]: tx(''),
    //[C.DC_STR_SYNC_MSG_BODY]: tx(''),
    [C.DC_STR_INCOMING_MESSAGES]: tx('incoming_messages'),
    [C.DC_STR_OUTGOING_MESSAGES]: tx('outgoing_messages'),
    [C.DC_STR_STORAGE_ON_DOMAIN]: tx('storage_on_domain'),
    [C.DC_STR_ONE_MOMENT]: tx('one_moment'),
    [C.DC_STR_CONNECTED]: tx('connectivity_connected'),
    [C.DC_STR_CONNTECTING]: tx('connectivity_connecting'),
    [C.DC_STR_UPDATING]: tx('connectivity_updating'),
    [C.DC_STR_SENDING]: tx('sending'),
    [C.DC_STR_LAST_MSG_SENT_SUCCESSFULLY]: tx('last_msg_sent_successfully'),
    [C.DC_STR_ERROR]: tx('error_x'),
    [C.DC_STR_NOT_SUPPORTED_BY_PROVIDER]: tx('not_supported_by_provider'),
    [C.DC_STR_MESSAGES]: tx('messages'),
    [C.DC_STR_BROADCAST_LIST]: tx('channel'),
    [C.DC_STR_PART_OF_TOTAL_USED]: tx('part_of_total_used'),
    [C.DC_STR_SECURE_JOIN_STARTED]: tx('secure_join_started'),
    [C.DC_STR_SECURE_JOIN_REPLIES]: tx('secure_join_replies'),
    [C.DC_STR_SETUP_CONTACT_QR_DESC]: tx('qrshow_join_contact_hint'),
    [C.DC_STR_SECURE_JOIN_GROUP_QR_DESC]: tx('qrshow_join_group_hint'),
    [C.DC_STR_NOT_CONNECTED]: tx('connectivity_not_connected'),
    [C.DC_STR_GROUP_NAME_CHANGED_BY_YOU]: tx('group_name_changed_by_you'),
    [C.DC_STR_GROUP_NAME_CHANGED_BY_OTHER]: tx('group_name_changed_by_other'),
    [C.DC_STR_GROUP_IMAGE_CHANGED_BY_YOU]: tx('group_image_changed_by_you'),
    [C.DC_STR_GROUP_IMAGE_CHANGED_BY_OTHER]: tx('group_image_changed_by_other'),
    [C.DC_STR_ADD_MEMBER_BY_YOU]: tx('add_member_by_you'),
    [C.DC_STR_ADD_MEMBER_BY_OTHER]: tx('add_member_by_other'),
    [C.DC_STR_REMOVE_MEMBER_BY_YOU]: tx('remove_member_by_you'),
    [C.DC_STR_REMOVE_MEMBER_BY_OTHER]: tx('remove_member_by_other'),
    [C.DC_STR_GROUP_LEFT_BY_YOU]: tx('group_left_by_you'),
    [C.DC_STR_GROUP_LEFT_BY_OTHER]: tx('group_left_by_other'),
    [C.DC_STR_GROUP_IMAGE_DELETED_BY_YOU]: tx('group_image_deleted_by_you'),
    [C.DC_STR_GROUP_IMAGE_DELETED_BY_OTHER]: tx('group_image_deleted_by_other'),
    [C.DC_STR_LOCATION_ENABLED_BY_YOU]: tx('location_enabled_by_you'),
    [C.DC_STR_LOCATION_ENABLED_BY_OTHER]: tx('location_enabled_by_other'),
    [C.DC_STR_EPHEMERAL_TIMER_DISABLED_BY_YOU]: tx(
      'ephemeral_timer_disabled_by_you'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_DISABLED_BY_OTHER]: tx(
      'ephemeral_timer_disabled_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_SECONDS_BY_YOU]: tx(
      'ephemeral_timer_seconds_by_you'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_SECONDS_BY_OTHER]: tx(
      'ephemeral_timer_seconds_by_other'
    ),
    // deprecated only used in older versions
    [C.DC_STR_EPHEMERAL_TIMER_1_MINUTE_BY_YOU]: tx(
      'ephemeral_timer_1_minute_by_you'
    ),
    // deprecated only used in older versions
    [C.DC_STR_EPHEMERAL_TIMER_1_MINUTE_BY_OTHER]: tx(
      'ephemeral_timer_1_minute_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_HOUR_BY_YOU]: tx(
      'ephemeral_timer_1_hour_by_you'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_HOUR_BY_OTHER]: tx(
      'ephemeral_timer_1_hour_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_DAY_BY_YOU]: tx('ephemeral_timer_1_day_by_you'),
    [C.DC_STR_EPHEMERAL_TIMER_1_DAY_BY_OTHER]: tx(
      'ephemeral_timer_1_day_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_WEEK_BY_YOU]: tx(
      'ephemeral_timer_1_week_by_you'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_WEEK_BY_OTHER]: tx(
      'ephemeral_timer_1_week_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_MINUTES_BY_YOU]: tx(
      'ephemeral_timer_minutes_by_you'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_MINUTES_BY_OTHER]: tx(
      'ephemeral_timer_minutes_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_HOURS_BY_YOU]: tx('ephemeral_timer_hours_by_you'),
    [C.DC_STR_EPHEMERAL_TIMER_HOURS_BY_OTHER]: tx(
      'ephemeral_timer_hours_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_DAYS_BY_YOU]: tx('ephemeral_timer_days_by_you'),
    [C.DC_STR_EPHEMERAL_TIMER_DAYS_BY_OTHER]: tx(
      'ephemeral_timer_days_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_WEEKS_BY_YOU]: tx('ephemeral_timer_weeks_by_you'),
    [C.DC_STR_EPHEMERAL_TIMER_WEEKS_BY_OTHER]: tx(
      'ephemeral_timer_weeks_by_other'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_YEAR_BY_YOU]: tx(
      'ephemeral_timer_1_year_by_you'
    ),
    [C.DC_STR_EPHEMERAL_TIMER_1_YEAR_BY_OTHER]: tx(
      'ephemeral_timer_1_year_by_other'
    ),
    [C.DC_STR_CHAT_PROTECTION_ENABLED]: tx(
      'chat_protection_enabled_tap_to_learn_more'
    ),
    [C.DC_STR_INVALID_UNENCRYPTED_MAIL]: tx(
      'invalid_unencrypted_tap_to_learn_more'
    ),
    [C.DC_STR_BACKUP_TRANSFER_QR]: tx('multidevice_qr_subtitle'),
    [C.DC_STR_YOU_REACTED]: tx('reaction_by_you'),
    [C.DC_STR_REACTED_BY]: tx('reaction_by_other'),
    [C.DC_STR_DONATION_REQUEST]: tx('donate_device_msg'),
  }

  await BackendRemote.rpc.setStockStrings(strings)
}
