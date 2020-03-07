import { C } from 'deltachat-node'
import logger from '../../shared/logger'
import SplitOut from './splitout'

const log = logger.getLogger('main/deltachat/chat')
export default class DCChat extends SplitOut {
  getChatMedia(msgType1: number, msgType2: number) {
    if (!this._controller._selectedChatId) return
    const mediaMessages = this._dc.getChatMedia(
      this._controller._selectedChatId,
      msgType1,
      msgType2,
      null
    )
    return mediaMessages.map(
      this._controller.messageList.messageIdToJson.bind(
        this._controller.messageList
      )
    )
  }

  getEncryptionInfo(contactId: number) {
    return this._dc.getContactEncryptionInfo(contactId)
  }

  getQrCode(chatId = 0) {
    return this._dc.getSecurejoinQrCode(chatId)
  }

  leaveGroup(chatId: number) {
    log.debug(`action - leaving chat ${chatId}`)
    this._dc.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
  }

  setName(chatId: number, name: string) {
    return this._dc.setChatName(chatId, name)
  }

  modifyGroup(chatId: number, name: string, image: string, remove: number[], add: number[]) {
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

  addContactToChat(chatId: number, contactId: number) {
    return this._dc.addContactToChat(chatId, contactId)
  }

  setProfileImage(chatId: number, newImage: string) {
    return this._dc.setChatProfileImage(chatId, newImage)
  }

  createGroupChat(verified: boolean, name: string) {
    const chatId =
      verified === true
        ? this._dc.createVerifiedGroupChat(name)
        : this._dc.createUnverifiedGroupChat(name)
    return chatId
  }

  delete(chatId: number) {
    log.debug(`action - deleting chat ${chatId}`)
    this._dc.deleteChat(chatId)
    this._controller.chatList.updateChatList()
  }

  archive(chatId: number, archive: boolean) {
    log.debug(`action - archiving chat ${chatId}`)
    this._dc.archiveChat(chatId, archive)
  }

  getChatContacts(chatId: number) {
    return this._dc.getChatContacts(chatId)
  }

  /**
   * @param {number} chatId
   */
  markNoticedChat(chatId: number) {
    this._dc.markNoticedChat(chatId)
  }
}
