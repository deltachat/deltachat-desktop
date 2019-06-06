const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatlist')

/**
 * Update query for rendering chats with search input
 */
function searchChats (query) {
  this._query = query
  this.updateChatList()
}

function selectChat (chatId) {
  this._selectedChatId = chatId
  let chat = this._getChatById(chatId, true)
  if (!chat) {
    log.debug(`Error: selected chat not found: ${chatId}`)
    return null
  }
  if (chat.id !== C.DC_CHAT_ID_DEADDROP) {
    if (chat.freshMessageCounter > 0) {
      this._dc.markNoticedChat(chat.id)
      chat.freshMessageCounter = 0
      if (this._saved.markRead) {
        log.debug('markSeenMessages', chat.messages.map((msg) => msg.id))
        this._dc.markSeenMessages(chat.messages.map((msg) => msg.id))
      }
    }
  }
  this.sendToRenderer('DD_EVENT_CHAT_SELECTED', { chat })
}

function updateChatList () {
  console.log('updateChatList')
  const chatList = this._chatList(this._showArchivedChats)
  this.sendToRenderer('DD_EVENT_CHATLIST_UPDATED', { chatList, showArchivedChats: this._showArchivedChats })
}

function _chatList (showArchivedChats) {
  if (!this._dc) return []

  const listFlags = showArchivedChats ? C.DC_GCL_ARCHIVED_ONLY : 0
  const list = this._dc.getChatList(listFlags, this._query)

  const chatList = []

  for (let i = 0; i < list.getCount(); i++) {
    const chatId = list.getChatId(i)
    const chat = this._getChatById(chatId)

    if (!chat) continue

    if (chat.id === C.DC_CHAT_ID_DEADDROP) {
      const messageId = list.getMessageId(i)
      chat.deaddrop = this._deadDropMessage(messageId)
    }

    // This is NOT the Chat Oject, it's a smaller version for use as ChatListItem in the ChatList
    chatList.push({
      id: chat.id,
      summary: list.getSummary(i).toJson(),
      name: chat.name,
      deaddrop: chat.deaddrop,
      freshMessageCounter: chat.freshMessageCounter,
      profileImage: chat.profileImage,
      color: chat.color,
      isVerified: chat.isVerified,
      isGroup: chat.isGroup,
      contacts: chat.contacts
    })
  }
  return chatList
}

function _forwardChatList (listFlags, query) {
  if (!this._dc) return []
  const list = this._dc.getChatList(listFlags, query)

  const chatList = []

  for (let i = 0; i < list.getCount(); i++) {
    const chatId = list.getChatId(i)
    const chat = this._getChatById(chatId)

    if (!chat || chat.id === C.DC_CHAT_ID_DEADDROP) continue

    // This is NOT the Chat Oject, it's a smaller version for use as ChatListItem in the ChatList
    chatList.push({
      id: chat.id,
      summary: list.getSummary(i).toJson(),
      name: chat.name,
      profileImage: chat.profileImage,
      color: chat.color,
      isVerified: chat.isVerified,
      isGroup: chat.isGroup
    })
  }
  return chatList
}

function _getChatById (chatId, loadMessages) {
  if (!chatId) return null
  const rawChat = this._dc.getChat(chatId)
  if (!rawChat) return null
  this._pages = 0
  const chat = rawChat.toJson()
  let draft = this._dc.getDraft(chatId)

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
  const list = this._dc.getChatList(0, this._query)

  var freshMessageCounter = 0
  for (let i = 0; i < list.getCount(); i++) {
    const chatId = list.getChatId(i)
    const chat = this._dc.getChat(chatId).toJson()

    if (!chat) continue

    if (chat.id !== C.DC_CHAT_ID_DEADDROP) {
      freshMessageCounter += this._dc.getFreshMessageCount(chatId)
    }
  }
  return freshMessageCounter
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
  this.searchChats = searchChats.bind(this)
  this.selectChat = selectChat.bind(this)
  this._chatList = _chatList.bind(this)
  this._forwardChatList = _forwardChatList.bind(this)
  this._getChatById = _getChatById.bind(this)
  this._getGeneralFreshMessageCounter = _getGeneralFreshMessageCounter.bind(this)
  this._deadDropMessage = _deadDropMessage.bind(this)
  this.showArchivedChats = showArchivedChats.bind(this)
  this.updateChatList = updateChatList.bind(this)
}
