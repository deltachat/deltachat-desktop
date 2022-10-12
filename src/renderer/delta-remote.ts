import { _callDcMethodAsync } from './ipc'

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
  // login ----------------------------------------------------
  call(fnName: 'login.selectAccount', accountId: number): Promise<boolean>
  // messageList --------------------------------------------------------
  call(
    fnName: 'messageList.saveMessageHTML2Disk',
    messageId: number
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
