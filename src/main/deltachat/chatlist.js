const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatlist')
const { app } = require('electron')

const { integerToHexColor } = require('./util')

const SplitOut = require('./splitout')
module.exports = class DCChatList extends SplitOut {
  selectChat (chatId) {
    this._controller._selectedChatId = chatId
    const chat = this.getFullChatById(chatId, true)
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

  onChatModified (chatId) {
    // TODO: move event handling to store
    const chat = this.getFullChatById(chatId)
    this._controller.sendToRenderer('DD_EVENT_CHAT_MODIFIED', { chatId, chat })
  }

  getChatListIds (listFlags, queryStr, queryContactId) {
    const chatList = this._dc.getChatList(listFlags, queryStr, queryContactId)
    const chatListIds = []
    for (let counter = 0; counter < chatList.getCount(); counter++) {
      const chatId = chatList.getChatId(counter)
      chatListIds.push(chatId)
    }
    return chatListIds
  }

  getListAndIndexForChatId (chatId) {
    let list = this._dc.getChatList(0, '', 0)
    let i = findIndexOfChatIdInChatList(list, chatId)

    if (i === -1) {
      list = this._dc.getChatList(1, '', 0)
      i = findIndexOfChatIdInChatList(list, chatId)
    }
    return [list, i]
  }

  getChatListItemsByIds (chatIds) {
    const chats = {}
    for (const chatId of chatIds) {
      chats[chatId] = this.getChatListItemById(chatId)
    }
    return chats
  }

  getChatListItemById (chatId, list, i) {
    const chat = this.__getChatById(chatId)
    if (chat === null) return null

    if (!list) [list, i] = this.getListAndIndexForChatId(chatId)
    if (!chat || i === -1) return null

    if (chat.id === C.DC_CHAT_ID_DEADDROP) {
      const messageId = list.getMessageId(i)
      chat.deaddrop = this._deadDropMessage(messageId)
    }

    // console.log('getChatListItemsByIds', chatId)
    const summary = list.getSummary(i).toJson()
    const lastUpdated = summary.timestamp ? summary.timestamp * 1000 : null

    if (summary.text2 === '[The message was sent with non-verified encryption.. See "Info" for details.]') {
      summary.text2 = this._controller.translate('message_not_verified')
    }
    const isGroup = isGroupChat(chat)
    const contactIds = this._dc.getChatContacts(chatId)
    // This is NOT the Chat Oject, it's a smaller version for use as ChatListItem in the ChatList
    return {
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
  }

  __getChatById (chatId) {
    if (!chatId) return null
    const rawChat = this._dc.getChat(chatId)
    if (!rawChat) return null
    return rawChat.toJson()
  }

  __getDraft (chatId) {
    const draft = this._dc.getDraft(chatId)
    return draft ? draft.getText() : ''
  }

  getFullChatById (chatId) {
    const chat = this.__getChatById(chatId)
    if (chat === null) return null
    this._controller._pages = 0

    const isGroup = isGroupChat(chat)
    const contactIds = this._dc.getChatContacts(chatId)

    const contacts = contactIds.map(id => this._dc.getContact(id).toJson())

    // This object is NOT created with object assign to promote consistency and to be easier to understand
    return {
      id: chat.id,
      name: chat.name,
      isVerified: chat.isVerified,
      profileImage: chat.profileImage,

      archived: chat.archived,
      subtitle: this.__chatSubtitle(chat, contacts),
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
      draft: this.__getDraft(chatId),
      selfInGroup: isGroup && contactIds.indexOf(C.DC_CONTACT_ID_SELF) !== -1
    }
  }

  __chatSubtitle (chat, contacts) {
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

  _getGeneralFreshMessageCounter () {
    return this._dc.getFreshMessages().length
  }

  _deadDropMessage (id) {
    const msg = this._dc.getMessage(id)
    const fromId = msg && msg.getFromId()
    if (!fromId) {
      log.warn('Ignoring DEADDROP due to missing fromId')
      return
    }
    const contact = this._dc.getContact(fromId).toJson()
    return { id, contact }
  }

  updateChatList () {
    log.debug('updateChatList')
    this._controller.sendToRenderer('DD_EVENT_CHATLIST_UPDATED')
  }
}
// section: Internal functions
function findIndexOfChatIdInChatList (list, chatId) {
  let i = -1
  for (let counter = 0; counter < list.getCount(); counter++) {
    const currentChatId = list.getChatId(counter)
    if (currentChatId === chatId) {
      i = counter
      break
    }
  }
  return i
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
