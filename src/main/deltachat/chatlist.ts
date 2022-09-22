import { C, ChatList } from 'deltachat-node'
import { JsonChat, JsonContact, FullChat } from '../../shared/shared-types'
import SplitOut from './splitout'

export default class DCChatList extends SplitOut {
  _chatListGetChatId(list: ChatList, index: number) {
    return list.getChatId(index)
  }

  async _getChatById(chatId: number): Promise<JsonChat | null> {
    if (!chatId) return null
    const rawChat = this.selectedAccountContext.getChat(chatId)
    if (!rawChat) return null
    return rawChat.toJson()
  }

  async _getChatContactIds(chatId: number) {
    return this.selectedAccountContext.getChatContacts(chatId)
  }

  async _getChatContacts(contactIds: number[]): Promise<JsonContact[]> {
    const contacts = []
    for (let i = 0; i < contactIds.length; i++) {
      const contact = this.controller.contacts._getContact(contactIds[i])
      contacts.push(contact)
    }
    return contacts
  }

  async isChatMuted(chatId: number): Promise<boolean> {
    const chat = await this._getChatById(chatId)
    if (!chat) {
      throw new Error('Chat is not defined')
    }
    return chat.muted
  }

  async getFullChatById(chatId: number): Promise<FullChat | null> {
    const chat = await this._getChatById(chatId)
    if (chat === null) return null

    const isGroup = isGroupChat(chat)
    const isBroadcast = isBroadcastList(chat)
    const contactIds = await this._getChatContactIds(chatId)

    const contacts = await this._getChatContacts(contactIds)
    const ephemeralTimer = this.selectedAccountContext.getChatEphemeralTimer(
      chatId
    )

    // This object is NOT created with object assign to promote consistency and to be easier to understand
    return {
      id: chat.id,
      name: chat.name,
      canSend: chat.canSend,
      isProtected: chat.isProtected,
      profileImage: chat.profileImage,

      archived: chat.archived,
      type: chat.type,
      isUnpromoted: chat.isUnpromoted, // new chat but no initial message sent
      isSelfTalk: chat.isSelfTalk,

      contacts: contacts,
      contactIds,
      color: chat.color,
      freshMessageCounter: this.selectedAccountContext.getFreshMessageCount(
        chatId
      ),
      isBroadcast: isBroadcast,
      isGroup: isGroup,
      isContactRequest: chat.isContactRequest,
      isDeviceChat: chat.isDeviceTalk,
      selfInGroup: isGroup && contactIds.indexOf(C.DC_CONTACT_ID_SELF) !== -1,
      muted: chat.muted,
      ephemeralTimer,
    }
  }

  getGeneralFreshMessageCounter() {
    return this.selectedAccountContext.getFreshMessages().length
  }
}
// section: Internal functions
function isGroupChat(chat: JsonChat) {
  return (
    chat &&
    (chat.type === C.DC_CHAT_TYPE_GROUP ||
      chat.type === C.DC_CHAT_TYPE_BROADCAST)
  )
}

function isBroadcastList(chat: JsonChat) {
  return chat && chat.type === C.DC_CHAT_TYPE_BROADCAST
}
// end section Internal functions
