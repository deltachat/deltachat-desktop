const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatlist')

/**
 * Update query for rendering chats with search input
 */
function searchChats (query) {
  this._query = query
  this._render()
}

function unblockContact (contactId) {
  const contact = this._dc.getContact(contactId)
  this._dc.blockContact(contactId, false)
  const name = contact.getNameAndAddress()
  log.info(`Unblocked contact ${name} (id = ${contactId})`)
}

function blockContact (contactId) {
  const contact = this._dc.getContact(contactId)
  this._dc.blockContact(contactId, true)
  const name = contact.getNameAndAddress()
  log.debug(`Blocked contact ${name} (id = ${contactId})`)
}
function deleteChat (chatId) {
  log.debug(`action - deleting chat ${chatId}`)
  this._dc.deleteChat(chatId)
  this._render()
}

function archiveChat (chatId, archive) {
  log.debug(`action - archiving chat ${chatId}`)
  this._dc.archiveChat(chatId, archive)
  this._render()
}

function showArchivedChats (show) {
  this._showArchivedChats = show
  this._render()
}

function leaveGroup (chatId) {
  log.debug(`action - leaving chat ${chatId}`)
  this._dc.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
}

function selectChat (chatId) {
  log.debug(`action - selecting chat ${chatId}`)
  this._pages = 1
  this._selectedChatId = chatId
  this._render()
}

function _chatList (showArchivedChats) {
  if (!this._dc) return []

  const listFlags = showArchivedChats ? C.DC_GCL_ARCHIVED_ONLY : 0
  const list = this._dc.getChatList(listFlags, this._query)
  const listCount = list.getCount()

  const chatList = []
  for (let i = 0; i < listCount; i++) {
    const chatId = list.getChatId(i)
    const chat = this._getChatListItemById(chatId)

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
  return chatList
}

function _getChatListItemById (chatId) {
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

    color: this._integerToHexColor(chat.color),
    summary: undefined,
    freshMessageCounter: this._dc.getFreshMessageCount(chatId),
    isGroup: this.isGroupChat(chat),
    isDeaddrop: chatId === C.DC_CHAT_ID_DEADDROP,
    draft: chat.draft
  }
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

module.exports = function () {
  this._getChatListItemById = _getChatListItemById.bind(this)
  this.searchChats = searchChats.bind(this)
  this.unblockContact = unblockContact.bind(this)
  this.blockContact = blockContact.bind(this)
  this.deleteChat = deleteChat.bind(this)
  this.archiveChat = archiveChat.bind(this)
  this.showArchivedChats = showArchivedChats.bind(this)
  this.leaveGroup = leaveGroup.bind(this)
  this.selectChat = selectChat.bind(this)
  this._chatList = _chatList.bind(this)
  this._getGeneralFreshMessageCounter = _getGeneralFreshMessageCounter.bind(this)
  this._deadDropMessage = _deadDropMessage.bind(this)
  this._selectedChat = _selectedChat.bind(this)
}
