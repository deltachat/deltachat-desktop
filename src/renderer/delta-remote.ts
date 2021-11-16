import { C } from 'deltachat-node/dist/constants'
import { _callDcMethodAsync } from './ipc'
import {
  FullChat,
  ChatListItemType,
  MessageType,
  JsonLocations,
  Theme,
  JsonContact,
  MessageSearchResult,
  Credentials,
  DeltaChatAccount,
  DesktopSettings,
  QrCodeResponse,
} from '../shared/shared-types'
import { MuteDuration } from '../shared/constants'
import { LocaleData } from '../shared/localize'

export type sendMessageParams = {
  text?: string | null
  filename?: string
  location?: {
    lat: number
    lng: number
  }
  quoteMessageId?: number
}

class DeltaRemote {
  // root ---------------------------------------------------------------
  call(fnName: 'updateBlockedContacts'): Promise<void>
  call(fnName: 'setProfilePicture', newImage: string): Promise<void>
  call(fnName: 'getProfilePicture'): Promise<string>
  call(fnName: 'getInfo'): Promise<{ [key: string]: any }>
  call(
    fnName: 'getProviderInfo',
    email: string
  ): Promise<{
    before_login_hint: string
    overview_page: string
    status: any
  }>
  call(fnName: 'checkValidEmail', email: string): Promise<boolean>
  call(fnName: 'joinSecurejoin', qrCode: string): Promise<number>
  call(fnName: 'stopOngoingProcess'): Promise<number>
  call(fnName: 'checkQrCode', qrCode: string): Promise<QrCodeResponse>
  // autocrypt ----------------------------------------------------------
  call(fnName: 'autocrypt.initiateKeyTransfer'): Promise<string>
  call(
    fnName: 'autocrypt.continueKeyTransfer',
    messageId: number,
    key: string
  ): Promise<boolean>
  // backup -------------------------------------------------------------
  call(fnName: 'backup.export', dir: string): Promise<void>
  call(fnName: 'backup.import', file: string): Promise<DeltaChatAccount>
  // chatList -----------------------------------------------------------
  call(fnName: 'chatList.selectChat', chatId: number): Promise<FullChat>
  call(fnName: 'chatList.getSelectedChatId'): Promise<number>
  call(fnName: 'chatList.onChatModified', chatId: number): Promise<void>
  call(
    fnName: 'chatList.getChatListEntries',
    listFlags?: number,
    queryStr?: string,
    queryContactId?: number
  ): Promise<[number, number][]>
  call(
    fnName: 'chatList.getChatListItemsByEntries',
    entries: [number, number][]
  ): Promise<{
    [key: number]: ChatListItemType
  }>
  call(fnName: 'chatList.getFullChatById', chatId: number): Promise<FullChat>
  call(fnName: 'chatList.getGeneralFreshMessageCounter'): Promise<number> // this method might be used for a favicon badge counter
  // contacts ------------------------------------------------------------
  call(fnName: 'contacts.unblockContact', contactId: number): Promise<void>
  call(fnName: 'contacts.blockContact', contactId: number): Promise<void>
  call(
    fnName: 'contacts.changeNickname',
    contactId: number,
    name: string
  ): Promise<number>
  call(
    fnName: 'contacts.createContact',
    email: string,
    name?: string
  ): Promise<number>
  call(
    fnName: 'contacts.createChatByContactId',
    contactId: number
  ): Promise<number>
  call(fnName: 'contacts.getContact', contactId: number): Promise<JsonContact>
  call(
    fnName: 'contacts.getContactIds',
    listFlags: number,
    queryStr: string
  ): Promise<number[]>
  call(
    fnName: 'contacts.getContacts',
    ids: number[]
  ): Promise<{ [id: number]: JsonContact }>
  call(
    fnName: 'getContacts2',
    listFlags: number,
    queryStr: string
  ): Promise<JsonContact[]>
  call(fnName: 'contacts.getEncryptionInfo', contactId: number): Promise<string>
  call(fnName: 'contacts.lookupContactIdByAddr', email: string): Promise<number>
  // chat ---------------------------------------------------------------
  call(
    fnName: 'chat.getChatMedia',
    chatId: number,
    msgType1: number,
    msgType2: number
  ): Promise<MessageType[]>
  call(fnName: 'chat.getEncryptionInfo', chatId: number): Promise<string>
  call(fnName: 'chat.getQrCode', chatId?: number): Promise<string>
  call(
    fnName: 'chat.getQrCodeSVG',
    chatId?: number
  ): Promise<{ content: string; svg: string }>
  call(fnName: 'chat.leaveGroup', chatId: number): Promise<void>
  call(fnName: 'chat.setName', chatId: number, name: string): Promise<boolean>
  call(
    fnName: 'chat.modifyGroup',
    chatId: number,
    name: string,
    image: string | undefined,
    members: number[] | null
  ): Promise<boolean>
  call(
    fnName: 'chat.addContactToChat',
    chatId: number,
    contactId: number
  ): Promise<boolean>
  call(
    fnName: 'chat.setProfileImage',
    chatId: number,
    newImage: string
  ): Promise<boolean>
  call(
    fnName: 'chat.setMuteDuration',
    chatId: number,
    duration: MuteDuration
  ): Promise<boolean>
  call(
    fnName: 'chat.createGroupChat',
    verified: boolean,
    name: string
  ): Promise<number>
  call(fnName: 'chat.delete', chatId: number): Promise<void>
  call(
    fnName: 'chat.setVisibility',
    chatId: number,
    visibility:
      | C.DC_CERTCK_AUTO
      | C.DC_CERTCK_STRICT
      | C.DC_CHAT_VISIBILITY_PINNED
  ): Promise<void>
  call(fnName: 'chat.getChatContacts', chatId: number): Promise<number[]>
  call(fnName: 'chat.markNoticedChat', chatId: number): Promise<void>
  call(fnName: 'chat.getChatEphemeralTimer', chatId: number): Promise<number>
  call(
    fnName: 'chat.setChatEphemeralTimer',
    chatId: number,
    ephemeralTimer: number
  ): Promise<void>
  call(fnName: 'chat.sendVideoChatInvitation', chatId: number): Promise<number>
  call(fnName: 'chat.accept', chatId: number): Promise<void>
  call(fnName: 'chat.block', chatId: number): Promise<void>
  call(
    fnName: 'chat.getNextMedia',
    messageId: number,
    direction: 1 | -1
  ): Promise<number>
  // locations ----------------------------------------------------------
  call(
    fnName: 'locations.setLocation',
    latitude: number,
    longitude: number,
    accuracy: number
  ): Promise<void>
  call(
    fnName: 'locations.getLocations',
    chatId: number,
    contactId: number,
    timestampFrom: number,
    timestampTo: number
  ): Promise<JsonLocations>
  // login ----------------------------------------------------
  call(fnName: 'login.selectAccount', accountId: number): Promise<boolean>
  call(
    fnName: 'login.updateCredentials',
    credentials: Credentials
  ): Promise<void>
  call(fnName: 'login.addAccount'): Promise<number>
  call(fnName: 'login.removeAccount', accountId: number): Promise<void>
  call(
    fnName: 'login.accountInfo',
    accountId: number
  ): Promise<DeltaChatAccount>
  call(fnName: 'login.getAccountSize', accountId: number): Promise<number>
  call(
    fnName: 'login.getFreshMessageCounter',
    accountId: number
  ): Promise<number>
  call(fnName: 'login.getAllAccountIds'): Promise<number[]>
  call(fnName: 'login.getLastLoggedInAccount'): Promise<number>
  call(fnName: 'login.getAllAccounts'): Promise<DeltaChatAccount[]>

  // NOTHING HERE that is called directly from the frontend, yet
  // messageList --------------------------------------------------------
  call(
    fnName: 'messageList.sendMessage',
    chatId: number,
    params: sendMessageParams
  ): Promise<[number, MessageType | null]>
  call(
    fnName: 'messageList.sendSticker',
    chatId: number,
    stickerPath: string
  ): Promise<void>
  call(fnName: 'messageList.deleteMessage', id: number): Promise<void>
  call(
    fnName: 'messageList.getMessage',
    msgId: number
  ): Promise<MessageType | null>
  call(
    fnName: 'messageList.getMessages',
    messageIds: number[]
  ): Promise<{ [key: number]: MessageType | null }>
  call(fnName: 'messageList.getMessageInfo', msgId: number): Promise<string>
  call(
    fnName: 'messageList.getDraft',
    chatId: number
  ): Promise<MessageType | null>
  call(
    fnName: 'messageList.setDraft',
    chatId: number,
    {
      text,
      file,
      quotedMessageId,
    }: { text?: string; file?: string; quotedMessageId?: number }
  ): Promise<void>
  call(
    fnName: 'messageList.messageIdToJson',
    id: number
  ): Promise<MessageType | null>
  call(
    fnName: 'messageList.getMessageIds',
    chatid: number,
    flags?: number
  ): Promise<number[]>
  call(
    fnName: 'messageList.forwardMessage',
    msgId: number,
    chatId: number
  ): Promise<void>
  call(
    fnName: 'messageList.searchMessages',
    query: string,
    chatId?: number
  ): Promise<number[]>
  call(
    fnName: 'messageList.msgIds2SearchResultItems',
    msgIds: number[]
  ): Promise<{ [id: number]: MessageSearchResult }>
  call(
    fnName: 'messageList.saveMessageHTML2Disk',
    messageId: number
  ): Promise<string>
  // settings -----------------------------------------------------------
  call(
    fnName: 'settings.setConfig',
    key: string,
    value: string
  ): Promise<boolean>
  call(fnName: 'settings.getConfig', key: string): Promise<string>
  call(
    fnName: 'settings.getConfigFor',
    keys: string[]
  ): Promise<{
    [key: string]: string
  }>
  call(fnName: 'settings.keysImport', directory: string): Promise<void>
  call(fnName: 'settings.keysExport', directory: string): Promise<void>
  call(
    fnName: 'settings.serverFlags',
    {
      mail_security,
      send_security,
    }: {
      mail_security?: string
      send_security?: string
    }
  ): Promise<number | ''>
  call(
    fnName: 'settings.setDesktopSetting',
    key: keyof DesktopSettings,
    value: string | number | boolean
  ): Promise<boolean>
  call(fnName: 'settings.getDesktopSettings'): Promise<DesktopSettings>
  call(
    fnName: 'settings.saveBackgroundImage',
    file: string,
    isDefaultPicture: boolean
  ): Promise<string>
  call(
    fnName: 'settings.estimateAutodeleteCount',
    fromServer: boolean,
    seconds: number
  ): Promise<number>
  call(fnName: 'settings.setConfigFromQr', qrCodeContent: string): Promise<void>
  // stickers -----------------------------------------------------------
  call(
    fnName: 'stickers.getStickers'
  ): Promise<{
    [key: string]: string[]
  }>
  // context ------------------------------------------------------------
  call(fnName: 'context.maybeNetwork'): Promise<void>
  call(fnName: 'context.getConnectivity'): Promise<number>
  call(fnName: 'context.getConnectivityHTML'): Promise<string>
  // burner accounts ------------------------------------------------------------
  call(
    fnName: 'burnerAccounts.create',
    url: string
  ): Promise<{ email: string; password: string }>
  // extras -------------------------------------------------------------
  call(fnName: 'extras.getLocaleData', locale: string): Promise<LocaleData>
  call(fnName: 'extras.setLocale', locale: string): Promise<void>
  call(
    fnName: 'extras.getActiveTheme'
  ): Promise<{
    theme: Theme
    data: string
  } | null>
  call(fnName: 'extras.setThemeFilePath', address: string): void
  call(fnName: 'extras.getAvailableThemes'): Promise<Theme[]>
  call(fnName: 'extras.setTheme', address: string): Promise<boolean>
  call(fnName: 'extras.writeClipboardToTempFile'): Promise<string>
  // catchall: ----------------------------------------------------------
  call(fnName: string): Promise<any>
  call(fnName: string, ...args: any[]): Promise<any> {
    return _callDcMethodAsync(fnName, ...args)
  }
}

export const DeltaBackend = new DeltaRemote()
