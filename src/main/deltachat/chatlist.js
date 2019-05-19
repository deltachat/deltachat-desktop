const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatlist')

const CHATLIST_PAGE_SIZE = 5
const CHATLIST_START_SIZE = 10

/**
 * Update query for rendering chats with search input
 */
function searchChats (query) {
  this._query = query
  this._render()
}

function selectChat (chatId) {
  log.debug(`action - selecting chat ${chatId}`)
  this._pages = 1
  this._selectedChatId = chatId
  const chat = this._getChatById(chatId)
  this.sendToRenderer('DD_EVENT_CHAT_SELECTED', { chat })
}

function _chatList (showArchivedChats) {
  if (!this._dc) return []

  const listFlags = showArchivedChats ? C.DC_GCL_ARCHIVED_ONLY : 0
  const list = this._dc.getChatList(listFlags, this._query)
  const listCount = list.getCount()

  const chatList = []
  const maxChats = (this._chatListPages * CHATLIST_PAGE_SIZE) + CHATLIST_START_SIZE

  for (let i = 0; i < maxChats; i++) {
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
      isGroup: chat.isGroup
    })
  }
  return { chatList, listCount }
}

function _getChatById (chatId) {
  if (!chatId) return null
  const rawChat = this._dc.getChat(chatId)
  if (!rawChat) return null

  const chat = rawChat.toJson()
  let draft = this._dc.getDraft(chatId)

  if (draft) {
    chat.draft = draft.getText()
  } else {
    chat.draft = ''
  }

  var messageIds = this._dc.getChatMessages(chat.id, C.DC_GCM_ADDDAYMARKER, 0)
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
    messages: this._messagesToRender(messageIds),
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
  const listCount = list.getCount()

  var freshMessageCounter = 0
  for (let i = 0; i < listCount; i++) {
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

function _selectedChat (showArchivedChats, chatList, selectedChatId) {
  let selectedChat = this._getChatById(selectedChatId)
  if (!selectedChat) return null
  if (selectedChat.id !== C.DC_CHAT_ID_DEADDROP) {
    if (selectedChat.freshMessageCounter > 0) {
      this._dc.markNoticedChat(selectedChat.id)
      selectedChat.freshMessageCounter = 0
    }

    if (this._saved.markRead) {
      this._dc.markSeenMessages(selectedChat.messages.map((msg) => msg.id))
    }
  }

  return selectedChat
}

function fetchChats () {
  this._chatListPages++
  this._render()
}

function showArchivedChats (show) {
  this._showArchivedChats = show
  this._render()
}

module.exports = function () {
  this.searchChats = searchChats.bind(this)
  this.selectChat = selectChat.bind(this)
  this._chatList = _chatList.bind(this)
  this._getChatById = _getChatById.bind(this)
  this._getGeneralFreshMessageCounter = _getGeneralFreshMessageCounter.bind(this)
  this._deadDropMessage = _deadDropMessage.bind(this)
  this._selectedChat = _selectedChat.bind(this)
  this.fetchChats = fetchChats.bind(this)
  this.showArchivedChats = showArchivedChats.bind(this)
}
