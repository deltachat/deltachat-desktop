const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/messagelist')
const { integerToHexColor } = require('./util')

const SplitOut = require('./splitout')
module.exports = class DCMessageList extends SplitOut {
  sendMessage (chatId, text, filename, location) {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this._dc.messageNew(viewType)
    if (filename) msg.setFile(filename)
    if (text) msg.setText(text)
    if (location) msg.setLocation(location.lat, location.lng)
    this._dc.sendMessage(chatId, msg)
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
    return {
      id,
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
    }
  }

  forwardMessage (msgId, chatId) {
    this._dc.forwardMessages(msgId, chatId)
    this._controller.chatList.selectChat(chatId)
  }

  getMessageIds(chatId) {
    const messageIds = this._dc.getChatMessages(chatId, C.DC_GCM_ADDDAYMARKER, 0)
    console.log(messageIds)
    return messageIds
  }

  getMessages(messageIds) {
    let messages = {}
    messageIds.forEach(messageId => {
      if (messageId <= C.DC_MSG_ID_LAST_SPECIAL) return
      messages[messageId] = this.messageIdToJson(messageId)
    })
    return messages
  }
}
