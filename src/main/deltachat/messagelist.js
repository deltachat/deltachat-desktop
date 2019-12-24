const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/messagelist')
const { integerToHexColor } = require('./util')
const filesizeConverter = require('filesize')
const mime = require('mime-types')

const SplitOut = require('./splitout')
module.exports = class DCMessageList extends SplitOut {
  sendMessage (chatId, text, filename, location) {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this._dc.messageNew(viewType)
    if (filename) msg.setFile(filename)
    if (text) msg.setText(text)
    if (location) msg.setLocation(location.lat, location.lng)
    const messageId = this._dc.sendMessage(chatId, msg)
    return [messageId, this.getMessage(messageId)]
  }

  sendSticker (chatId, stickerPath) {
    const viewType = 23
    const msg = this._dc.messageNew(viewType)
    msg.setFile(stickerPath)
    this._dc.sendMessage(chatId, msg)
  }

  deleteMessage (id) {
    log.info(`deleting message ${id}`)
    this._dc.deleteMessages(id)
  }

  getMessage (msgId) {
    return this.messageIdToJson(msgId)
  }

  getMessageInfo (msgId) {
    return this._dc.getMessageInfo(msgId)
  }

  setDraft (chatId, msgText) {
    const msg = this._dc.messageNew()
    msg.setText(msgText)

    this._dc.setDraft(chatId, msg)
  }

  messageIdToJson (id) {
    const msg = this._dc.getMessage(id)
    if (!msg) {
      log.warn('No message found for ID ' + id)
      return { msg: null }
    }
    return this.messageToJson(msg)
  }

  messageToJson (msg) {
    const filemime = msg.getFilemime()
    const filename = msg.getFilename()
    const filesize = msg.getFilebytes()
    const viewType = msg.getViewType()
    const fromId = msg.getFromId()
    const isMe = fromId === C.DC_CONTACT_ID_SELF
    const setupCodeBegin = msg.getSetupcodebegin()
    const contact = fromId ? this._dc.getContact(fromId).toJson() : {}
    if (contact.color) {
      contact.color = integerToHexColor(contact.color)
    }
    return convert({
      id: msg.id,
      msg: msg.toJson(),
      filemime,
      filename,
      filesize,
      viewType,
      fromId,
      isMe,
      contact,
      isInfo: msg.isInfo(),
      setupCodeBegin
    })
  }

  forwardMessage (msgId, chatId) {
    this._dc.forwardMessages(msgId, chatId)
    this._controller.chatList.selectChat(chatId)
  }

  getMessageIds (chatId) {
    const messageIds = this._dc.getChatMessages(chatId, C.DC_GCM_ADDDAYMARKER, 0)
    return messageIds
  }

  getMessages (messageIds) {
    const messages = {}
    messageIds.forEach(messageId => {
      if (messageId <= C.DC_MSG_ID_LAST_SPECIAL) return
      messages[messageId] = this.messageIdToJson(messageId)
    })
    return messages
  }

  /**
   * @param {number[]} messageIds
   */
  markSeenMessages (messageIds) {
    this._dc.markSeenMessages(messageIds)
  }
}

function convert (message) {
  const msg = message.msg

  Object.assign(msg, {
    sentAt: msg.timestamp * 1000,
    receivedAt: msg.receivedTimestamp * 1000,
    direction: message.isMe ? 'outgoing' : 'incoming',
    status: convertMessageStatus(msg.state)
  })

  if (msg.file) {
    msg.attachment = {
      url: msg.file,
      contentType: convertContentType(message),
      fileName: message.filename || msg.text,
      fileSize: filesizeConverter(message.filesize)
    }
  }

  return message
}

function convertMessageStatus (s) {
  switch (s) {
    case C.DC_STATE_IN_FRESH:
      return 'sent'
    case C.DC_STATE_OUT_FAILED:
      return 'error'
    case C.DC_STATE_IN_SEEN:
      return 'read'
    case C.DC_STATE_IN_NOTICED:
      return 'read'
    case C.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case C.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    case C.DC_STATE_OUT_PENDING:
      return 'sending'
    case C.DC_STATE_UNDEFINED:
      return 'error'
  }
}

function convertContentType (message) {
  const filemime = message.filemime

  if (!filemime) return 'application/octet-stream'
  if (filemime !== 'application/octet-stream') return filemime

  switch (message.msg.viewType) {
    case C.DC_MSG_IMAGE:
      return 'image/jpg'
    case C.DC_MSG_VOICE:
      return 'audio/ogg'
    case C.DC_MSG_FILE:
      const type = mime.lookup(message.msg.file)
      if (type) return type
      else return 'application/octet-stream'
    default:
      return 'application/octet-stream'
  }
}
