import { BackendRemote } from '../backend-com'

export async function modifyGroup(
  accountId: number,
  chatId: number,
  name: string,
  image: string | null | undefined
): Promise<void> {
  const chat = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)

  await BackendRemote.rpc.setChatName(accountId, chatId, name)

  if (typeof image !== 'undefined' && chat.profileImage !== image) {
    await BackendRemote.rpc.setChatProfileImage(
      accountId,
      chatId,
      image || null
    )
  }
}
