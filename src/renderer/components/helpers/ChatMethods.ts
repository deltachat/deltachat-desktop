import ChatStore from '../../stores/chat'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export const selectChat = async (chatId: number) => {
  await ChatStore.effect.selectChat(chatId)
}

export const jumpToMessage = (
  msgId: number,
  highlight?: undefined | boolean,
  msgParentId?: undefined | number
) => {
  ChatStore.effect.jumpToMessage(msgId, highlight, msgParentId)
}

export function forwardMessage(
  accountId: number,
  messageId: number,
  chatId: number
) {
  return BackendRemote.rpc.forwardMessages(accountId, [messageId], chatId)
}

export const deleteMessage = (messageId: number) => {
  BackendRemote.rpc.deleteMessages(selectedAccountId(), [messageId])
}
