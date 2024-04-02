import ChatStore from '../../stores/chat'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const log = getLogger('renderer/message')

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

export async function modifyGroup(
  chatId: number,
  name: string,
  image: string | null | undefined,
  members: number[] | null
) {
  const accountId = selectedAccountId()
  log.debug('action - modify group', { chatId, name, image, members })

  const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)

  await BackendRemote.rpc.setChatName(accountId, chatId, name)

  if (typeof image !== 'undefined' && chat.profileImage !== image) {
    await BackendRemote.rpc.setChatProfileImage(
      accountId,
      chatId,
      image || null
    )
  }

  if (members !== null) {
    const previousMembers = [...chat.contactIds]
    const remove = previousMembers.filter(m => !members.includes(m))
    const add = members.filter(m => !previousMembers.includes(m))

    await Promise.all(
      remove.map(id =>
        BackendRemote.rpc.removeContactFromChat(accountId, chatId, id)
      )
    )
    await Promise.all(
      add.map(id => BackendRemote.rpc.addContactToChat(accountId, chatId, id))
    )
  }
}
