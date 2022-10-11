import { _callDcMethodAsync } from './ipc'
import { DeltaChatAccount } from '../shared/shared-types'

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
  // backup -------------------------------------------------------------
  call(fnName: 'backup.export', dir: string): Promise<void>
  call(fnName: 'backup.import', file: string): Promise<DeltaChatAccount>
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
    fnName: 'messageList.saveMessageHTML2Disk',
    messageId: number
  ): Promise<string>
  // settings -----------------------------------------------------------
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
  // catchall: ----------------------------------------------------------
  call(fnName: string): Promise<any>
  call(fnName: string, ...args: any[]): Promise<any> {
    return _callDcMethodAsync(fnName, ...args)
  }
}

export const DeltaBackend = new DeltaRemote()
