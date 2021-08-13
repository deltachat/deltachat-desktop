import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'
import { MessageType } from '../../shared/shared-types'

const log = getLogger('main/deltachat/chat')
export default class DCChat extends SplitOut {
  getChatMedia(msgType1: number, msgType2: number): MessageType[] {
    if (!this._controller._selectedChatId) return
    const mediaMessages = this.selectedAccountContext.getChatMedia(
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
    return this.selectedAccountContext.getChatEncrytionInfo(chatId)
  }

  getQrCode(chatId = 0) {
    return this.selectedAccountContext.getSecurejoinQrCode(chatId)
  }

  leaveGroup(chatId: number) {
    log.debug(`action - leaving chat ${chatId}`)
    this.selectedAccountContext.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
  }

  setName(chatId: number, name: string) {
    return this.selectedAccountContext.setChatName(chatId, name)
  }

  modifyGroup(
    chatId: number,
    name: string,
    image: string,
    remove: number[],
    add: number[]
  ) {
    log.debug('action - modify group', { chatId, name, image, remove, add })
    this.selectedAccountContext.setChatName(chatId, name)
    const chat = this.selectedAccountContext.getChat(chatId)
    if (chat.getProfileImage() !== image) {
      this.selectedAccountContext.setChatProfileImage(chatId, image || '')
    }
    remove.forEach(id => this.selectedAccountContext.removeContactFromChat(chatId, id))
    add.forEach(id => this.selectedAccountContext.addContactToChat(chatId, id))
    return true
  }

  addContactToChat(chatId: number, contactId: number) {
    return this.selectedAccountContext.addContactToChat(chatId, contactId)
  }

  setProfileImage(chatId: number, newImage: string) {
    return this.selectedAccountContext.setChatProfileImage(chatId, newImage)
  }

  /**
   * @returns id of the created chat
   */
  createGroupChat(verified: boolean, name: string) {
    return this.selectedAccountContext.createGroupChat(name, verified)
  }

  delete(chatId: number) {
    log.debug(`action - deleting chat ${chatId}`)
    this.selectedAccountContext.deleteChat(chatId)
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
    this.selectedAccountContext.setChatVisibility(chatId, visibility)
  }

  setMuteDuration(chatId: number, duration: number) {
    log.debug(`action - set chat ${chatId} muteduration ${duration}`)
    return this.selectedAccountContext.setChatMuteDuration(chatId, duration)
  }

  getChatContacts(chatId: number) {
    return this.selectedAccountContext.getChatContacts(chatId)
  }

  /**
   * @param {number} chatId
   */
  markNoticedChat(chatId: number) {
    this.selectedAccountContext.markNoticedChat(chatId)
  }

  getChatEphemeralTimer(chatId: number) {
    return this.selectedAccountContext.getChatEphemeralTimer(chatId)
  }

  setChatEphemeralTimer(chatId: number, timer: number) {
    return this.selectedAccountContext.setChatEphemeralTimer(chatId, timer)
  }

  async sendVideoChatInvitation(chatId: number) {
    return await this.selectedAccountContext.sendVideochatInvitation(chatId)
  }
}
