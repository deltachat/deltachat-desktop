const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chat')
const SplitOut = require('./splitout')
module.exports = class DCChat extends SplitOut {
  getChatMedia (msgType1, msgType2) {
    if (!this._controller._selectedChatId) return
    const mediaMessages = this._dc.getChatMedia(this._controller._selectedChatId, msgType1, msgType2)
    return mediaMessages.map(
      this._controller.messageList.messageIdToJson.bind(this._controller.messageList)
    )
  }

  getEncryptionInfo (contactId) {
    return this._dc.getContactEncryptionInfo(contactId)
  }

  getQrCode (chatId = 0) {
    return this._dc.getSecurejoinQrCode(chatId)
  }

  leaveGroup (chatId) {
    log.debug(`action - leaving chat ${chatId}`)
    this._dc.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
  }

  setName (chatId, name) {
    return this._dc.setChatName(chatId, name)
  }

  modifyGroup (chatId, name, image, remove, add) {
    log.debug('action - modify group', { chatId, name, image, remove, add })
    this._dc.setChatName(chatId, name)
    const chat = this._dc.getChat(chatId)
    if (chat.getProfileImage() !== image) {
      this._dc.setChatProfileImage(chatId, image || '')
    }
    remove.forEach(id => this._dc.removeContactFromChat(chatId, id))
    add.forEach(id => this._dc.addContactToChat(chatId, id))
    return true
  }

  addContactToChat (chatId, contactId) {
    return this._dc.addContactToChat(chatId, contactId)
  }

  setProfileImage (chatId, newImage) {
    return this._dc.setChatProfileImage(chatId, newImage)
  }

  createGroupChat (verified, name) {
    const chatId = verified === true
      ? this._dc.createVerifiedGroupChat(name)
      : this._dc.createUnverifiedGroupChat(name)
    return chatId
  }

  delete (chatId) {
    log.debug(`action - deleting chat ${chatId}`)
    this._dc.deleteChat(chatId)
    this._controller.chatList.updateChatList()
  }

  archive (chatId, archive) {
    log.debug(`action - archiving chat ${chatId}`)
    this._dc.archiveChat(chatId, archive)
  }

  getChatContacts (chatId) {
    return this._dc.getChatContacts(chatId)
  }

  /**
   * @param {number} chatId
   */
  markNoticedChat (chatId) {
    this._dc.markNoticedChat(chatId)
  }
}
