const C = require('deltachat-node/constants')

const PAGE_SIZE = 20

function _selectedChat (showArchivedChats, selectedChatId) {
  let selectedChat = this._getChatById(selectedChatId)
  if (!selectedChat) return null

  var messageIds = this._dc.getChatMessages(selectedChat.id, C.DC_GCM_ADDDAYMARKER, 0)
  // This object is NOT created with object assign to promote consistency and to be easier to understand
  selectedChat.totalMessages = messageIds.length
  selectedChat.messages = this._messagesToRender(messageIds)

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

function _messagesToRender (messageIds) {
  const countMessages = messageIds.length
  const messageIdsToRender = messageIds.splice(
    Math.max(countMessages - (this._pages * PAGE_SIZE), 0),
    countMessages
  )

  if (messageIdsToRender.length === 0) return []

  let messages = Array(messageIdsToRender.length)

  for (let i = messageIdsToRender.length - 1; i >= 0; i--) {
    let id = messageIdsToRender[i]
    let json = this.messageIdToJson(id)

    if (id === C.DC_MSG_ID_DAYMARKER) {
      json.daymarker = {
        timestamp: messages[i + 1].msg.timestamp,
        id: 'd' + i
      }
    }
    messages[i] = json
  }

  return messages
}

function messageIdToJson (id) {
  const msg = this._dc.getMessage(id)
  const filemime = msg.getFilemime()
  const filename = msg.getFilename()
  const filesize = msg.getFilebytes()
  const fromId = msg.getFromId()
  const isMe = fromId === C.DC_CONTACT_ID_SELF
  const setupCodeBegin = msg.getSetupcodebegin()
  const contact = fromId ? this._dc.getContact(fromId).toJson() : {}
  if (contact.color) {
    contact.color = this._integerToHexColor(contact.color)
  }

  return {
    id,
    msg: msg.toJson(),
    filemime,
    filename,
    filesize,
    fromId,
    isMe,
    contact,
    isInfo: msg.isInfo(),
    setupCodeBegin
  }
}

function fetchMessages () {
  this._pages++
  this._render()
}

function forwardMessage (msgId, contactId) {
  const chatId = this._dc.getChatIdByContactId(contactId)
  this._dc.forwardMessages(msgId, chatId)
  this.selectChat(chatId)
}

function getChatMedia (msgType1, msgType2) {
  if (!this._selectedChatId) return
  const mediaMessages = this._dc.getChatMedia(this._selectedChatId, msgType1, msgType2)
  return mediaMessages.map(this.messageIdToJson.bind(this))
}

function sendMessage (chatId, text, filename, opts) {
  const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
  const msg = this._dc.messageNew(viewType)
  if (filename) msg.setFile(filename)
  if (text) msg.setText(text)
  this._dc.sendMessage(chatId, msg)
}

function deleteMessage (id) {
  log.info(`deleting message ${id}`)
  this._dc.deleteMessages(id)
}

module.exports = function() {
  this._selectedChat = _selectedChat.bind(this)
  this._messagesToRender = _messagesToRender.bind(this)
  this.messageIdToJson = messageIdToJson.bind(this)
  this.fetchMessages = fetchMessages.bind(this)
  this.forwardMessage = forwardMessage.bind(this)
  this.getChatMedia = getChatMedia.bind(this)
  this.sendMessage = sendMessage.bind(this)
  this.deleteMessage = deleteMessage.bind(this)
}
