import { BackendRemote } from '../backend-com'

export async function modifyGroup(
  accountId: number,
  chatId: number,
  name: string,
  image: string | null | undefined,
  members: number[] | null
) {
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

  return await BackendRemote.rpc.getFullChatById(accountId, chatId)
}
