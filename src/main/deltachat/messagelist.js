const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/messagelist')
const { integerToHexColor } = require('./util')
const CHATVIEW_PAGE_SIZE = 20

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
    const messageObj = this.messageIdToJson(msgId)
    this._controller.sendToRenderer('DD_EVENT_MSG_UPDATE', { messageObj })
  }

  getMessageInfo (msgId) {
    return this._dc.getMessageInfo(msgId)
  }

  setDraft (chatId, msgText) {
    const msg = this._dc.messageNew()
    msg.setText(msgText)

    this._dc.setDraft(chatId, msg)
  }

  _messagesToRender (messageIds) {
    // we need one more message than we render, to get the timestamp
    // from preceeding message for DAYMARKER
    const currentIndex = (this._controller._pages * CHATVIEW_PAGE_SIZE)
    messageIds.reverse() // newest IDs first
    const messageIdsToRender = messageIds.splice(
      currentIndex,
      CHATVIEW_PAGE_SIZE + 1
    )
    if (messageIdsToRender.length === 0) return []
    messageIdsToRender.reverse() // newest IDs last
    const messages = []
    for (let i = 0; i < messageIdsToRender.length; i++) {
      const id = messageIdsToRender[i]
      if (id > C.DC_MSG_ID_LAST_SPECIAL) {
        messages.push(this.messageIdToJson(id))
      } else if (id === C.DC_MSG_ID_DAYMARKER && messages.length > 0) {
        const timestamp = messages[messages.length - 1].msg.timestamp
        const json = {
          id,
          msg: {
            text: '',
            timestamp
          },
          daymarker: {
            timestamp,
            id: 'd' + i
          }
        }
        messages.push(json)
      }
    }
    return messages
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

  fetchMessages (chatId) {
    var messageIds = this._dc.getChatMessages(chatId, C.DC_GCM_ADDDAYMARKER, 0)
    if (messageIds.length <= this._controller._pages * CHATVIEW_PAGE_SIZE) {
      return
    }
    this._controller._pages++
    var payload = {
      chatId: chatId,
      totalMessages: messageIds.length,
      messages: this._messagesToRender(messageIds)
    }
    this._controller.sendToRenderer('DD_MESSAGES_LOADED', payload)
  }

  forwardMessage (msgId, chatId) {
    this._dc.forwardMessages(msgId, chatId)
    this._controller.chatList.selectChat(chatId)
  }
}
