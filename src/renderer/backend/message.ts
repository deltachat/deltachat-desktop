import { BackendRemote } from '../backend-com'

export async function forwardMessage(
  accountId: number,
  messageId: number,
  chatId: number
) {
  await BackendRemote.rpc.forwardMessages(accountId, [messageId], chatId)
}

export async function deleteMessage(accountId: number, messageId: number) {
  await BackendRemote.rpc.deleteMessages(accountId, [messageId])
}
