import ChatStore from '../../stores/chat'

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
