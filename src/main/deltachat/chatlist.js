const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatlist', true)
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
    if (chat.id !== C.DC_CHAT_ID_DEADDROP) {
      if (chat.freshMessageCounter > 0) {
        this._dc.markNoticedChat(chat.id)
        chat.freshMessageCounter = 0
        const messagIds = chat.messages.map((msg) => msg.id)
        log.debug('markSeenMessages', messagIds)
        this._dc.markSeenMessages(messagIds)
        app.setBadgeCount(this._getGeneralFreshMessageCounter())
      }
    }
    this._controller.sendToRenderer('DD_EVENT_CHAT_SELECTED', { chat })
  }

  onChatModified (chatId) {
    const listFlags = 0
    const list = this._dc.getChatList(listFlags, '')
    const chatList = []
    let i = -1
    for (let counter = 0; counter < list.getCount(); counter++) {
      const id = list.getChatId(counter)
      chatList.push(id)
      if (id === chatId) i = counter
    }
    if (i === -1) return
    const chat = this.getChatListItem(chatId, list, i)
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

  getChatListItems (chatIds) {
    const chats = {}
    console.time('getChatListItems')
    let list = this._dc.getChatList(0, '', 0)
    if (!findIndexOfChatIdInChatList(list, chatIds[0])) {
      list = this._dc.getChatList(1, '', 0)
    }

    let last_i = 0
    for (const chatId of chatIds) {
      last_i = findIndexOfChatIdInChatList(list, last_i, chatId)
      chats[chatId] = this.getChatListItem(chatId, list, last_i)
    }
    console.timeEnd('getChatListItems')
    return chats
  }

  __getChatAsJson (chatId) {
    if (!chatId) return null
    const chat = this._dc.getChat(chatId)
    if (!chat) return null
    return chat.toJson()
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


  __getChatListItemDeaddrop(chatId, list, i) {
    if (!chatId === C.DC_CHAT_ID_DEADDROP) return false 

    const messageId = list.getMessageId(i)    
    const msg = this._dc.getMessage(messageId)
    const fromId = msg && msg.getFromId()
    if (!fromId) {
      log.warn('Ignoring DEADDROP due to missing fromId')
      return
    }
    const contact = this._dc.getContact(fromId).toJson()
    return { 
      contactId: fromId,
      nameAndAddr: contact.nameAndAddr,
      address: contact.address 
    }    
  }

  getChatListItem (chatId, list, i) {
    console.time('getChatListItem', i)
    const chat = this.__getChatAsJson(chatId)
    if (!chat) return null

    // draft
    let draft = this._dc.getDraft(chatId)
    if (draft) {
      draft = draft.getText()
    } else {
      draft = ''
    }

    // deaddrop
    let deaddrop = this.__getChatListItemDeaddrop(chatId, list, i)


    // summary
    const summary = list.getSummary(i).toJson()
    summary.status = mapCoreMsgStatus2String(summary.state)
    if (summary.text2 === '[The message was sent with non-verified encryption.. See "Info" for details.]') {
      summary.text2 = this._controller.translate('message_not_verified')
    }

    const lastUpdated = summary.timestamp ? summary.timestamp * 1000 : null
    const color = integerToHexColor(chat.color)
    const freshMessageCounter = this._dc.getFreshMessageCount(chat.id)

    // ToDo: refactor to profileImage
    const avatarPath = chat.profileImage

    // ToDo: get actual email and not just the name/email of the last active group/chat contact
    const email = summary.text1

    const chatListItem = {
      ...chat,
      draft,
      deaddrop,
      summary,
      lastUpdated,
      color,
      freshMessageCounter,
      avatarPath,
      email
    }
    console.timeEnd('getChatListItem', i)
    return chatListItem
  }

  getFullChatById (chatId, loadMessages) {
    if (!chatId) return null
    const rawChat = this._dc.getChat(chatId)
    if (!rawChat) return null
    this._controller._pages = 0
    const chat = rawChat.toJson()
    const draft = this._dc.getDraft(chatId)

    if (draft) {
      chat.draft = draft.getText()
    } else {
      chat.draft = ''
    }

    const messageIds = this._dc.getChatMessages(chat.id, C.DC_GCM_ADDDAYMARKER, 0)
    const messages = loadMessages ? this._controller.messageList._messagesToRender(messageIds) : []
    const contacts = this._dc.getChatContacts(chatId).map(id => this._dc.getContact(id).toJson())
    const isGroup = isGroupChat(chat)
    let selfInGroup = isGroup
    if (isGroup && contacts.find(contact => contact.id === C.DC_CONTACT_ID_SELF) === undefined) {
      selfInGroup = false
    }
    // This object is NOT created with object assign to promote consistency and to be easier to understand

    return {
      id: chat.id,
      name: chat.name,
      isVerified: chat.isVerified,
      profileImage: chat.profileImage,

      archived: chat.archived,
      subtitle: this.__chatSubtitle(chat, contacts),
      type: chat.type,
      isUnpromoted: chat.isUnpromoted,
      isSelfTalk: chat.isSelfTalk,

      contacts: contacts,
      totalMessages: messageIds.length,
      messages: messages,
      color: integerToHexColor(chat.color),
      summary: undefined,
      freshMessageCounter: this._dc.getFreshMessageCount(chatId),
      isGroup: isGroup,
      isDeaddrop: chatId === C.DC_CHAT_ID_DEADDROP,
      draft: chat.draft,
      selfInGroup: selfInGroup
    }
  }

  __chatSubtitle (chat, contacts) {
    const tx = this._controller.translate
    if (chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
      if (isGroupChat(chat)) {
        return tx('n_members', [contacts.length], { quantity: contacts.length })
      } else if (contacts.length >= 1) {
        if (chat.type === C.DC_CHAT_TYPE_SINGLE && contacts[0].id === C.DC_CONTACT_ID_SELF) {
          return tx('chat_self_talk_subtitle')
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


  updateChatList () {
    log.debug('updateChatList')
    this._controller.sendToRenderer('DD_EVENT_CHATLIST_UPDATED')
  }
}
// section: Internal functions
function findIndexOfChatIdInChatList (list, last_i, chatId) {
  let i = -1
  for (let counter = last_i; counter < list.getCount(); counter++) {
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
    case C.DC_STATE_IN_FRESH:
      return 'delivered'
    case C.DC_STATE_IN_SEEN:
      return 'delivered'
    case C.DC_STATE_IN_NOTICED:
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
