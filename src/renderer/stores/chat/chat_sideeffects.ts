import { BackendRemote } from '../../backend-com'

export function saveLastChatId(chatId: number) {
  if (window.__selectedAccountId) {
    BackendRemote.rpc.setConfig(
      window.__selectedAccountId,
      'ui.lastchatid',
      String(chatId)
    )
  }
}
