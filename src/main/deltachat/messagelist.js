const C = require('deltachat-node/constants')

const PAGE_SIZE = 20

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
    isGroup: this.isGroupChat(chat),
    isDeaddrop: chatId === C.DC_CHAT_ID_DEADDROP,
    draft: chat.draft
  }
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
  this._getChatById = _getChatById.bind(this)
  this._messagesToRender = _messagesToRender.bind(this)
  this.messageIdToJson = messageIdToJson.bind(this)
  this.fetchMessages = fetchMessages.bind(this)
  this.forwardMessage = forwardMessage.bind(this)
  this.getChatMedia = getChatMedia.bind(this)
  this.sendMessage = sendMessage.bind(this)
  this.deleteMessage = deleteMessage.bind(this)
}
