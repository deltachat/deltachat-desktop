import { C, ChatList } from 'deltachat-node'
import { Context } from 'deltachat-node/dist/context'
import { app } from 'electron'
import { getLogger } from '../../shared/logger'
import {
  ChatListItemType,
  JsonChat,
  JsonContact,
  FullChat,
} from '../../shared/shared-types'
import SplitOut from './splitout'

const log = getLogger('main/deltachat/chatlist')

export default class DCChatList extends SplitOut {
  async selectChat(chatId: number) {
    this.controller.selectedChatId = chatId
    const chat = await this.getFullChatById(chatId)
    if (!chat) {
      log.debug(`Error: selected chat not found: ${chatId}`)
      return null
    }
    if (!chat.isContactRequest && chat.freshMessageCounter > 0) {
      this.selectedAccountContext.markNoticedChat(chat.id)
      this.controller.emit('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', chat.id)
      chat.freshMessageCounter = 0
      app.setBadgeCount(this.getGeneralFreshMessageCounter())
    }

    return chat
  }

  getSelectedChatId() {
    return this.controller.selectedChatId
  }

  _chatListGetChatId(list: ChatList, index: number) {
    return list.getChatId(index)
  }

  async getChatListEntries(
    ...args: Parameters<typeof Context.prototype.getChatList>
  ) {
    const chatList = this.selectedAccountContext.getChatList(...args)
    const chatListJson: [number, number][] = []
    for (let counter = 0; counter < chatList.getCount(); counter++) {
      const chatId = await chatList.getChatId(counter)
      const messageId = await chatList.getMessageId(counter)
      chatListJson.push([chatId, messageId])
    }
    return chatListJson
  }

  async getChatListItemsByEntries(entries: [number, number][]) {
    // const label = '[BENCH] getChatListItemsByEntries'
    // console.time(label)
    const chats: { [key: number]: ChatListItemType } = {}
    for (const entry of entries) {
      const chat = await this.getChatListItemByEntry(entry)
      chats[entry[0]] = chat
    }
    // console.timeEnd(label)
    return chats
  }

  async getChatListItemByEntry([chatId, messageId]: [
    number,
    number
  ]): Promise<ChatListItemType> {
    const chat = await this._getChatById(chatId)
    if (chat === null) return null

    const summary = this.selectedAccountContext
      .getChatlistItemSummary(chatId, messageId)
      .toJson()
    const lastUpdated = summary.timestamp ? summary.timestamp * 1000 : null

    const name = chat.name || summary.text1
    const isGroup = isGroupChat(chat)
    const contactIds = await this._getChatContactIds(chatId)
    /**
     * This is NOT the Chat Object, it's a smaller version for use as ChatListItem in the ChatList
     */
    const chatListItem = {
      id: chat.id,
      name,
      avatarPath: chat.profileImage,
      color: chat.color,
      lastUpdated: lastUpdated,
      summary: {
        text1: summary.text1,
        text2: summary.text2,
        status: mapCoreMsgStatus2String(summary.state),
      },
      isProtected: chat.isProtected,
      isGroup: isGroup,
      freshMessageCounter: this.selectedAccountContext.getFreshMessageCount(
        chatId
      ),
      isContactRequest: chat.isContactRequest,
      isArchiveLink: chat.id === C.DC_CHAT_ID_ARCHIVED_LINK,
      contactIds,
      isSelfTalk: chat.isSelfTalk,
      isDeviceTalk: chat.isDeviceTalk,
      selfInGroup: isGroup && contactIds.indexOf(C.DC_CONTACT_ID_SELF) !== -1,
      archived: chat.archived,
      pinned: chat.pinned,
      muted: chat.muted,
    }

    return chatListItem
  }

  async _getChatById(chatId: number): Promise<JsonChat> {
    if (!chatId) return null
    const rawChat = this.selectedAccountContext.getChat(chatId)
    if (!rawChat) return null
    return rawChat.toJson()
  }

  async _getChatContactIds(chatId: number) {
    return this.selectedAccountContext.getChatContacts(chatId)
  }

  async _getChatContact(contactId: number) {
    return this.selectedAccountContext.getContact(contactId).toJson()
  }

  async _getChatContacts(contactIds: number[]): Promise<JsonContact[]> {
    const contacts = []
    for (let i = 0; i < contactIds.length; i++) {
      const contact = await this._getChatContact(contactIds[i])
      contacts.push(contact)
    }
    return contacts
  }

  async isChatMuted(chatId: number): Promise<boolean> {
    const chat = await this._getChatById(chatId)
    return chat.muted
  }

  async getFullChatById(chatId: number): Promise<FullChat> {
    const chat = await this._getChatById(chatId)
    if (chat === null) return null

    const isGroup = isGroupChat(chat)
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

  updateChatList() {
    log.debug('updateChatList')
    this.controller.sendToRenderer('DD_EVENT_CHATLIST_UPDATED')
  }
}
// section: Internal functions

function mapCoreMsgStatus2String(state: number) {
  switch (state) {
    case C.DC_STATE_OUT_FAILED:
      return 'error'
    case C.DC_STATE_OUT_PENDING:
      return 'sending'
    case C.DC_STATE_OUT_PREPARING:
      return 'sending'
    case C.DC_STATE_OUT_DRAFT:
      return 'draft'
    case C.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case C.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    default:
      return '' // to display no icon on unknown state
  }
}
function isGroupChat(chat: JsonChat) {
  return chat && chat.type === C.DC_CHAT_TYPE_GROUP
}
// end section Internal functions
