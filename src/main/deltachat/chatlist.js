const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatlist')
const { app } = require('electron')

function selectChat (chatId) {
  this._selectedChatId = chatId
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
  this.sendToRenderer('DD_EVENT_CHAT_SELECTED', { chat })
}

function chatModified (chatId) {
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
  const chat = this.getSmallChatById(chatId, list, i)
  this.sendToRenderer('DD_EVENT_CHAT_MODIFIED', { chatId, chat })
}

function getChatListIds (listFlags, queryStr, queryContactId) {
  const chatList = this._dc.getChatList(listFlags, queryStr, queryContactId)
  const chatListIds = []
  for (let counter = 0; counter < chatList.getCount(); counter++) {
    const chatId = chatList.getChatId(counter)
    chatListIds.push(chatId)
  }
  return chatListIds
}

function findIndexOfChatIdInChatList(list, chatId) {
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
    
function getListAndIndexForChatId(chatId) {
  let list = this._dc.getChatList(0, '', 0)
  let i = findIndexOfChatIdInChatList(list, chatId)

  if (i == -1) {
    list = this._dc.getChatList(1, '', 0)
    i = findIndexOfChatIdInChatList(list, chatId)
  }
  return [list, i]
}

function getSmallChatById (chatId, list, i) {
  const chat = this.getFullChatById(chatId)

  if(!list) [list, i] = this.getListAndIndexForChatId(chatId)
  if (!chat || i === -1) return null

  if (chat.id === C.DC_CHAT_ID_DEADDROP) {
    const messageId = list.getMessageId(i)
    chat.deaddrop = this._deadDropMessage(messageId)
  }

  if (chat.id === C.DC_CHAT_ID_ARCHIVED_LINK) {
    chat.isArchiveLink = true
  }

  const summary = list.getSummary(i).toJson()
  const lastUpdated = summary.timestamp ? summary.timestamp * 1000 : null

  // This is NOT the Chat Oject, it's a smaller version for use as ChatListItem in the ChatList
  return {
    id: chat.id,
    email: summary.text1,
    name: chat.name,
    avatarPath: chat.profileImage,
    color: chat.color,
    lastUpdated: lastUpdated,
    subtitle: chat.subtitle,
    summary: {
      text1: summary.text1,
      text2: summary.text2,
      status: mapCoreMsgStatus2String(summary.state)
    },
    contacts: chat.contacts,
    isVerified: chat.isVerified,
    isGroup: chat.isGroup,
    freshMessageCounter: chat.freshMessageCounter,
    isArchiveLink: chat.isArchiveLink
  }
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

function getFullChatById (chatId, loadMessages) {
  if (!chatId) return null
  const rawChat = this._dc.getChat(chatId)
  if (!rawChat) return null
  this._pages = 0
  const chat = rawChat.toJson()
  const draft = chatId === 6 ? '' : this._dc.getDraft(chatId)

  if (draft) {
    chat.draft = draft.getText()
  } else {
    chat.draft = ''
  }

  const messageIds = this._dc.getChatMessages(chat.id, C.DC_GCM_ADDDAYMARKER, 0)
  const messages = loadMessages ? this._messagesToRender(messageIds) : []

  // This object is NOT created with object assign to promote consistency and to be easier to understand
  return {
    id: chat.id,
    name: chat.name,
    isVerified: chat.isVerified,
    profileImage: chat.profileImage,

    archived: chat.archived,
    subtitle: chat.subtitle,
    type: chat.type,
    isUnpromoted: chat.isUnpromoted,
    isSelfTalk: chat.isSelfTalk,

    contacts: this._dc.getChatContacts(chatId).map(id => this._dc.getContact(id).toJson()),
    totalMessages: messageIds.length,
    messages: messages,
    color: this._integerToHexColor(chat.color),
    summary: undefined,
    freshMessageCounter: this._dc.getFreshMessageCount(chatId),
    isGroup: isGroupChat(chat),
    isDeaddrop: chatId === C.DC_CHAT_ID_DEADDROP,
    draft: chat.draft
  }
}

function isGroupChat (chat) {
  return [
    C.DC_CHAT_TYPE_GROUP,
    C.DC_CHAT_TYPE_VERIFIED_GROUP
  ].includes(chat && chat.type)
}

function _getGeneralFreshMessageCounter () {
  return this._dc.getFreshMessages().length
}

function _deadDropMessage (id) {
  const msg = this._dc.getMessage(id)
  const fromId = msg && msg.getFromId()

  if (!fromId) {
    log.warn('Ignoring DEADDROP due to missing fromId')
    return
  }

  const contact = this._dc.getContact(fromId).toJson()
  return { id, contact }
}

function showArchivedChats (show) {
  this._showArchivedChats = show
  this.updateChatList()
}

module.exports = function () {
  this.selectChat = selectChat.bind(this)
  this.getSmallChatById = getSmallChatById.bind(this)
  this.getFullChatById = getFullChatById.bind(this)
  this._getGeneralFreshMessageCounter = _getGeneralFreshMessageCounter.bind(this)
  this._deadDropMessage = _deadDropMessage.bind(this)
  this.chatModified = chatModified.bind(this)
  this.getChatListIds = getChatListIds.bind(this)
  this.getListAndIndexForChatId = getListAndIndexForChatId.bind(this)
}
