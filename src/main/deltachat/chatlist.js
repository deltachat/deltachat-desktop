const C = require('deltachat-node/constants')
const log = require('../../shared/logger').getLogger('main/deltachat/chatlist')
const { app } = require('electron')

const { integerToHexColor } = require('../../shared/util')

const SplitOut = require('./splitout')
module.exports = class DCChatList extends SplitOut {
  async selectChat (chatId) {
    this._controller._selectedChatId = chatId
    const chat = await this.getFullChatById(chatId, true)
    if (!chat) {
      log.debug(`Error: selected chat not found: ${chatId}`)
      return null
    }
    if (chat.id !== C.DC_CHAT_ID_DEADDROP && chat.freshMessageCounter > 0) {
      this._dc.markNoticedChat(chat.id)
      chat.freshMessageCounter = 0
      const messagIds = this._controller.messageList.getMessageIds(chatId)
      log.debug('markSeenMessages', messagIds)
      // TODO: move mark seen logic to frontend
      this._dc.markSeenMessages(messagIds)
      app.setBadgeCount(this._getGeneralFreshMessageCounter())
    }
    return chat
  }

  /**
   * @returns {number} chat id
   */
  getSelectedChatId () {
    return this._controller._selectedChatId
  }

  async onChatModified (chatId) {
    // TODO: move event handling to store
    const chat = await this.getFullChatById(chatId)
    this._controller.sendToRenderer('DD_EVENT_CHAT_MODIFIED', { chatId, chat })
  }

  async _chatListGetChatId (list, index) {
    return list.getChatId(index)
  }

  async getChatListIds (listFlags, queryStr, queryContactId) {
    const chatList = this._dc.getChatList(listFlags, queryStr, queryContactId)
    const chatListIds = []
    for (let counter = 0; counter < chatList.getCount(); counter++) {
      const chatId = await this._chatListGetChatId(chatList, counter)
      chatListIds.push(chatId)
    }
    return chatListIds
  }

  async _getChatList (listflags, queryStr, queryContactId) {
    return this._dc.getChatList(listflags, queryStr, queryContactId)
  }

  async getListAndIndexForChatId (chatId) {
    let list = await this._getChatList(0, '', 0)
    let i = await findIndexOfChatIdInChatList(list, chatId)

    if (i === -1) {
      list = await this._getChatList(1, '', 0)
      i = await findIndexOfChatIdInChatList(list, chatId)
    }
    return [list, i]
  }

  async getChatListItemsByIds (chatIds) {
    const label = '[BENCH] getChatListItemByIds'
    console.time(label)
    const chats = {}
    let list
    let i = 0
    for (const chatId of chatIds) {
      if (!list) {
        [list, i] = await this.getListAndIndexForChatId(chatIds[0])
      } else {
        i = await findIndexOfChatIdInChatList(list, chatId, i)
      }

      const chat = await this.getChatListItemById(chatId, list, i)
      chats[chatId] = chat
    }
    console.timeEnd(label)
    return chats
  }

  async getChatListSummary (list, i) {
    return list.getSummary(i).toJson()
  }

  async getChatListItemById (chatId, list, i) {
    const chat = await this._getChatById(chatId)
    if (chat === null) return null

    if (!list) [list, i] = await this.getListAndIndexForChatId(chatId)
    if (!chat || i === -1) return null

    if (chat.id === C.DC_CHAT_ID_DEADDROP) {
      const messageId = list.getMessageId(i)
      chat.deaddrop = await this._deadDropMessage(messageId)
    }

    // console.log('getChatListItemsByIds', chatId)
    const summary = await this.getChatListSummary(list, i)
    const lastUpdated = summary.timestamp ? summary.timestamp * 1000 : null

    if (summary.text2 === '[The message was sent with non-verified encryption.. See "Info" for details.]') {
      summary.text2 = this._controller.translate('message_not_verified')
    }
    const isGroup = isGroupChat(chat)
    const contactIds = await this._getChatContactIds(chatId)
    // This is NOT the Chat Oject, it's a smaller version for use as ChatListItem in the ChatList
    const chatListItem = {
      id: chat.id,
      name: chat.name || summary.text1,
      avatarPath: chat.profileImage,
      color: integerToHexColor(chat.color),
      lastUpdated: lastUpdated,
      summary: {
        text1: summary.text1,
        text2: summary.text2,
        status: mapCoreMsgStatus2String(summary.state)
      },
      deaddrop: chat.deaddrop,
      isVerified: chat.isVerified,
      isGroup: isGroup,
      freshMessageCounter: this._dc.getFreshMessageCount(chatId),
      isArchiveLink: chat.id === C.DC_CHAT_ID_ARCHIVED_LINK,
      contactIds,
      isSelfTalk: chat.isSelfTalk,
      isDeviceTalk: chat.isDeviceTalk,
      selfInGroup: isGroup && contactIds.indexOf(C.DC_CONTACT_ID_SELF) !== -1
    }

    return chatListItem
  }

  async _getChatById (chatId) {
    if (!chatId) return null
    const rawChat = this._dc.getChat(chatId)
    if (!rawChat) return null
    return rawChat.toJson()
  }

  async _getDraft (chatId) {
    const draft = this._dc.getDraft(chatId)
    return draft ? draft.getText() : ''
  }

  async _getChatContactIds (chatId) {
    return this._dc.getChatContacts(chatId)
  }

  async _getChatContact (contactId) {
    return this._dc.getContact(contactId).toJson()
  }

  async _getChatContacts (contactIds) {
    const contacts = []
    for (let i = 0; i < contactIds.length; i++) {
      const contact = await this._getChatContact(contactIds[i])
      contacts.push(contact)
    }
    return contacts
  }

  async getFullChatById (chatId) {
    const chat = await this._getChatById(chatId)
    if (chat === null) return null
    this._controller._pages = 0

    const isGroup = isGroupChat(chat)
    const contactIds = await this._getChatContactIds(chatId)

    const contacts = await this._getChatContacts(contactIds)
    const draft = await this._getDraft(chatId)

    // This object is NOT created with object assign to promote consistency and to be easier to understand
    return {
      id: chat.id,
      name: chat.name,
      isVerified: chat.isVerified,
      profileImage: chat.profileImage,

      archived: chat.archived,
      subtitle: await this._chatSubtitle(chat, contacts),
      type: chat.type,
      isUnpromoted: chat.isUnpromoted, // new chat but no initial message sent
      isSelfTalk: chat.isSelfTalk,

      contacts: contacts,
      contactIds,
      color: integerToHexColor(chat.color),
      summary: undefined,
      freshMessageCounter: this._dc.getFreshMessageCount(chatId),
      isGroup: isGroup,
      isDeaddrop: chatId === C.DC_CHAT_ID_DEADDROP,
      isDeviceChat: chat.isDeviceTalk,
      draft,
      selfInGroup: isGroup && contactIds.indexOf(C.DC_CONTACT_ID_SELF) !== -1
    }
  }

  _chatSubtitle (chat, contacts) {
    const tx = this._controller.translate
    if (chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
      if (isGroupChat(chat)) {
        return tx('n_members', [contacts.length], { quantity: contacts.length })
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
        // case C.DC_CHAT_ID_STARRED:
        //   return 'stared'
      }
    }
    return 'ErrTitle'
  }

  getGeneralFreshMessageCounter () {
    return this._dc.getFreshMessages().length
  }

  async _getMessage (id) {
    return this._dc.getMessage(id)
  }

  async _deadDropMessage (id) {
    const msg = await this._getMessage(id)
    const fromId = msg && msg.getFromId()
    if (!fromId) {
      log.warn('Ignoring DEADDROP due to missing fromId')
      return
    }
    const contact = await this._getChatContact(fromId)
    return { id, contact }
  }

  updateChatList () {
    log.debug('updateChatList')
    this._controller.sendToRenderer('DD_EVENT_CHATLIST_UPDATED')
  }
}
// section: Internal functions
async function findIndexOfChatIdInChatList (list, chatId, startI = 0) {
  let i = -1
  const listCount = list.getCount()
  for (let counter = startI; counter < listCount; counter++) {
    counter = counter % listCount
    const currentChatId = await chatListGetChatId(list, counter)
    if (currentChatId === chatId) {
      i = counter
      break
    }
  }
  return i
}

async function chatListGetChatId (list, index) {
  return list.getChatId(index)
}

function mapCoreMsgStatus2String (state) {
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
function isGroupChat (chat) {
  return [
    C.DC_CHAT_TYPE_GROUP,
    C.DC_CHAT_TYPE_VERIFIED_GROUP
  ].includes(chat && chat.type)
}
// end section Internal functions
