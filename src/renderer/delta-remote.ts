import { _callDcMethodAsync } from './ipc'
import {
  Theme,
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
  call(fnName: 'joinSecurejoin', qrCode: string): Promise<number>
  // backup -------------------------------------------------------------
  call(fnName: 'backup.export', dir: string): Promise<void>
  call(fnName: 'backup.import', file: string): Promise<DeltaChatAccount>
  // contacts ------------------------------------------------------------
  call(
    fnName: 'contacts.changeNickname',
    contactId: number,
    name: string
  ): Promise<number>
  call(fnName: 'contacts.deleteContact', contactId: number): Promise<boolean>
  // chat ---------------------------------------------------------------
  call(
    fnName: 'chat.modifyGroup',
    chatId: number,
    name: string,
    image: string | undefined,
    members: number[] | null
  ): Promise<boolean>
  // login ----------------------------------------------------
  call(fnName: 'login.selectAccount', accountId: number): Promise<boolean>
  // messageList --------------------------------------------------------
  call(
    fnName: 'messageList.sendSticker',
    chatId: number,
    stickerPath: string
  ): Promise<void>
  call(
    fnName: 'messageList.saveMessageHTML2Disk',
    messageId: number
  ): Promise<string>
  // settings -----------------------------------------------------------
  call(fnName: 'settings.keysImport', directory: string): Promise<void>
  call(fnName: 'settings.keysExport', directory: string): Promise<void>
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
  call(fnName: 'extras.getAvailableThemes'): Promise<Theme[]>
  call(fnName: 'extras.setTheme', address: string): Promise<boolean>
  // catchall: ----------------------------------------------------------
  call(fnName: string): Promise<any>
  call(fnName: string, ...args: any[]): Promise<any> {
    return _callDcMethodAsync(fnName, ...args)
  }
}

export const DeltaBackend = new DeltaRemote()
