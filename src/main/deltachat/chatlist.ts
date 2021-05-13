import DeltaChat, { C, ChatList } from 'deltachat-node'
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
    this._controller._selectedChatId = chatId
    const chat = await this.getFullChatById(chatId)
    if (!chat) {
      log.debug(`Error: selected chat not found: ${chatId}`)
      return null
    }
    if (chat.id !== C.DC_CHAT_ID_DEADDROP && chat.freshMessageCounter > 0) {
      this._dc.markNoticedChat(chat.id)
      this._controller.emit('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', chat.id)
      chat.freshMessageCounter = 0
      app.setBadgeCount(this.getGeneralFreshMessageCounter())
    }

    return chat
  }

  getSelectedChatId() {
    return this._controller._selectedChatId
  }

  async onChatModified(chatId: number) {
    // TODO: move event handling to store
    const chat = await this.getFullChatById(chatId)
    this._controller.sendToRenderer('DD_EVENT_CHAT_MODIFIED', { chatId, chat })
  }

  _chatListGetChatId(list: ChatList, index: number) {
    return list.getChatId(index)
  }

  async getChatListIds(
    ...args: Parameters<typeof DeltaChat.prototype.getChatList>
  ) {
    const chatList = this._dc.getChatList(...args)
    const chatListIds = []
    for (let counter = 0; counter < chatList.getCount(); counter++) {
      const chatId = await this._chatListGetChatId(chatList, counter)
      chatListIds.push(chatId)
    }
    return chatListIds
  }

  async getChatListEntries(
    ...args: Parameters<typeof DeltaChat.prototype.getChatList>
  ) {
    const chatList = this._dc.getChatList(...args)
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

    let deaddrop
    if (chat.id === C.DC_CHAT_ID_DEADDROP) {
      deaddrop = this._controller.messageList.getMessage(messageId)
    }

    const summary = this._dc.getChatlistItemSummary(chatId, messageId).toJson()
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
      deaddrop,
      isProtected: chat.isProtected,
      isGroup: isGroup,
      freshMessageCounter: this._dc.getFreshMessageCount(chatId),
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
    const rawChat = this._dc.getChat(chatId)
    if (!rawChat) return null
    return rawChat.toJson()
  }

  async _getChatContactIds(chatId: number) {
    return this._dc.getChatContacts(chatId)
  }

  async _getChatContact(contactId: number) {
    return this._dc.getContact(contactId).toJson()
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
    this._controller._pages = 0

    const isGroup = isGroupChat(chat)
    const contactIds = await this._getChatContactIds(chatId)

    const contacts = await this._getChatContacts(contactIds)
    const ephemeralTimer = this._dc.getChatEphemeralTimer(chatId)

    // This object is NOT created with object assign to promote consistency and to be easier to understand
    return {
      id: chat.id,
      name: chat.name,
      isProtected: chat.isProtected,
      profileImage: chat.profileImage,

      archived: chat.archived,
      subtitle: await this._chatSubtitle(chat, contacts),
      type: chat.type,
      isUnpromoted: chat.isUnpromoted, // new chat but no initial message sent
      isSelfTalk: chat.isSelfTalk,

      contacts: contacts,
      contactIds,
      color: chat.color,
      freshMessageCounter: this._dc.getFreshMessageCount(chatId),
      isGroup: isGroup,
      isDeaddrop: chatId === C.DC_CHAT_ID_DEADDROP,
      isDeviceChat: chat.isDeviceTalk,
      selfInGroup: isGroup && contactIds.indexOf(C.DC_CONTACT_ID_SELF) !== -1,
      muted: chat.muted,
      ephemeralTimer,
    }
  }

  _chatSubtitle(chat: JsonChat, contacts: JsonContact[]) {
    const tx = this._controller.translate
    if (chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
      if (isGroupChat(chat)) {
        return tx('n_members', [String(contacts.length)], {
          quantity: contacts.length,
        })
      } else if (chat.type === C.DC_CHAT_TYPE_MAILINGLIST) {
        return tx('mailing_list')
      } else if (contacts.length >= 1) {
        if (chat.isSelfTalk) {
          return tx('chat_self_talk_subtitle')
        } else if (chat.isDeviceTalk) {
          return tx('device_talk_subtitle')
        }
        return contacts[0].address
      }
    } else {
      switch (chat.id) {
        case C.DC_CHAT_ID_DEADDROP:
          return tx('menu_deaddrop_subtitle')
      }
    }
    return 'ErrTitle'
  }

  getGeneralFreshMessageCounter() {
    return this._dc.getFreshMessages().length
  }

  updateChatList() {
    log.debug('updateChatList')
    this._controller.sendToRenderer('DD_EVENT_CHATLIST_UPDATED')
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
