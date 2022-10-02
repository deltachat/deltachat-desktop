import { C } from 'deltachat-node/node/dist/constants'
import { _callDcMethodAsync } from './ipc'
import {
  JsonLocations,
  Theme,
  MessageSearchResult,
  DeltaChatAccount,
  DesktopSettingsType,
} from '../shared/shared-types'
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
  call(fnName: 'setProfilePicture', newImage: string | null): Promise<void>
  call(fnName: 'joinSecurejoin', qrCode: string): Promise<number>
  // backup -------------------------------------------------------------
  call(fnName: 'backup.export', dir: string): Promise<void>
  call(fnName: 'backup.import', file: string): Promise<DeltaChatAccount>
  // chatList -----------------------------------------------------------
  call(fnName: 'chatList.onChatModified', chatId: number): Promise<void>
  // contacts ------------------------------------------------------------
  call(
    fnName: 'contacts.changeNickname',
    contactId: number,
    name: string
  ): Promise<number>
  call(fnName: 'contacts.lookupContactIdByAddr', email: string): Promise<number>
  call(fnName: 'contacts.deleteContact', contactId: number): Promise<boolean>
  // chat ---------------------------------------------------------------
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
  call(fnName: 'chat.createBroadcastList'): Promise<number>
  call(
    fnName: 'chat.createGroupChat',
    verified: boolean,
    name: string
  ): Promise<number>
  call(
    fnName: 'chat.setVisibility',
    chatId: number,
    visibility:
      | C.DC_CERTCK_AUTO
      | C.DC_CERTCK_STRICT
      | C.DC_CHAT_VISIBILITY_PINNED
  ): Promise<void>
  call(fnName: 'chat.getChatContacts', chatId: number): Promise<number[]>
  call(fnName: 'chat.getChatEphemeralTimer', chatId: number): Promise<number>
  call(
    fnName: 'chat.setChatEphemeralTimer',
    chatId: number,
    ephemeralTimer: number
  ): Promise<void>
  call(fnName: 'chat.sendVideoChatInvitation', chatId: number): Promise<number>
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
  call(fnName: 'login.getAccountSize', accountId: number): Promise<number>
  call(fnName: 'login.getLastLoggedInAccount'): Promise<number>

  // NOTHING HERE that is called directly from the frontend, yet
  // messageList --------------------------------------------------------
  call(
    fnName: 'messageList.sendSticker',
    chatId: number,
    stickerPath: string
  ): Promise<void>
  call(fnName: 'messageList.downloadFullMessage', msgId: number): Promise<void>
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
    key: keyof DesktopSettingsType,
    value: string | number | boolean
  ): Promise<boolean>
  call(fnName: 'settings.getDesktopSettings'): Promise<DesktopSettingsType>
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
  // stickers -----------------------------------------------------------
  call(
    fnName: 'stickers.getStickers'
  ): Promise<{
    [key: string]: string[]
  }>
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
  // webxdc: ------------------------------------------------------------
  call(fnName: 'webxdc.clearWebxdcDOMStorage'): Promise<void>
  call(
    fnName: 'webxdc.getWebxdcDiskUsage'
  ): Promise<{
    total_size: number
    data_size: number
  }>
  // catchall: ----------------------------------------------------------
  call(fnName: string): Promise<any>
  call(fnName: string, ...args: any[]): Promise<any> {
    return _callDcMethodAsync(fnName, ...args)
  }
}

export const DeltaBackend = new DeltaRemote()
