const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/messagelist')

const CHATVIEW_PAGE_SIZE = 20

function sendMessage (chatId, text, filename, location) {
  const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
  const msg = this._dc.messageNew(viewType)
  if (filename) msg.setFile(filename)
  if (text) msg.setText(text)
  if (location) msg.setLocation(location.lat, location.lng)
  this._dc.sendMessage(chatId, msg)
}

function deleteMessage (id) {
  log.info(`deleting message ${id}`)
  this._dc.deleteMessages(id)
}

function setDraft (chatId, msgText) {
  let msg = this._dc.messageNew()
  msg.setText(msgText)

  this._dc.setDraft(chatId, msg)
}

function _messagesToRender (messageIds) {
  const currentIndex = this._pages * CHATVIEW_PAGE_SIZE
  const isLastPage = messageIds.length < currentIndex
  const messageIdsToRender = messageIds.splice(
    isLastPage ? 0 : -currentIndex,
    isLastPage ? messageIds.length - currentIndex : CHATVIEW_PAGE_SIZE
  )

  if (messageIdsToRender.length === 0) return []

  let messages = []

  for (let i = messageIdsToRender.length - 1; i >= 0; i--) {
    let id = messageIdsToRender[i]
    let json = this.messageIdToJson(id)
    if (messages[i + 1] && id === C.DC_MSG_ID_DAYMARKER) {
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
  if (!msg) {
    log.warn('No message found for ID ' + id)
    return { msg: null }
  }
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

function fetchMessages (chatId) {
  var messageIds = this._dc.getChatMessages(chatId, C.DC_GCM_ADDDAYMARKER, 0)
  if (messageIds.length <= this._pages * CHATVIEW_PAGE_SIZE) {
    return
  }
  this._pages++
  var payload = {
    chatId: chatId,
    totalMessages: messageIds.length,
    messages: this._messagesToRender(messageIds)
  }
  this.sendToRenderer('DD_MESSAGES_LOADED', payload)
}

function forwardMessage (msgId, contactId) {
  const chatId = this._dc.getChatIdByContactId(contactId)
  this._dc.forwardMessages(msgId, chatId)
  this.selectChat(chatId)
}
module.exports = function () {
  this.sendMessage = sendMessage.bind(this)
  this.deleteMessage = deleteMessage.bind(this)
  this.setDraft = setDraft.bind(this)
  this._messagesToRender = _messagesToRender.bind(this)
  this.messageIdToJson = messageIdToJson.bind(this)
  this.fetchMessages = fetchMessages.bind(this)
  this.forwardMessage = forwardMessage.bind(this)
}
