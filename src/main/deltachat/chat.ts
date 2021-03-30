import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'
import { MessageType } from '../../shared/shared-types'

const log = getLogger('main/deltachat/chat')
export default class DCChat extends SplitOut {
  getChatMedia(msgType1: number, msgType2: number): MessageType[] {
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

  getEncryptionInfo(chatId: number) {
    return this._dc.getChatEncrytionInfo(chatId)
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

  modifyGroup(
    chatId: number,
    name: string,
    image: string,
    remove: number[],
    add: number[]
  ) {
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

  /**
   * @returns id of the created chat
   */
  createGroupChat(verified: boolean, name: string) {
    return this._dc.createGroupChat(name, verified)
  }

  delete(chatId: number) {
    log.debug(`action - deleting chat ${chatId}`)
    this._dc.deleteChat(chatId)
    this._controller.chatList.updateChatList()
    this._controller.emit('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', chatId)
  }

  setVisibility(
    chatId: number,
    visibility:
      | C.DC_CHAT_VISIBILITY_NORMAL
      | C.DC_CHAT_VISIBILITY_ARCHIVED
      | C.DC_CHAT_VISIBILITY_PINNED
  ) {
    log.debug(`action - set chat ${chatId} visibility ${visibility}`)
    this._dc.setChatVisibility(chatId, visibility)
  }

  setMuteDuration(chatId: number, duration: number) {
    log.debug(`action - set chat ${chatId} muteduration ${duration}`)
    return this._dc.setChatMuteDuration(chatId, duration)
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

  getChatEphemeralTimer(chatId: number) {
    return this._dc.getChatEphemeralTimer(chatId)
  }

  setChatEphemeralTimer(chatId: number, timer: number) {
    return this._dc.setChatEphemeralTimer(chatId, timer)
  }

  async sendVideoChatInvitation(chatId: number) {
    return await this._dc.sendVideochatInvitation(chatId)
  }
}
