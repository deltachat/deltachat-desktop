import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'
import { set_has_unread } from '../tray'
import { app } from 'electron'

const log = getLogger('main/deltachat/chat')
export default class DCChat extends SplitOut {
  getEncryptionInfo(chatId: number) {
    return this.selectedAccountContext.getChatEncrytionInfo(chatId)
  }

  getQrCode(chatId = 0) {
    return this.selectedAccountContext.getSecurejoinQrCode(chatId)
  }

  getQrCodeSVG(chatId = 0): { content: string; svg: string } {
    return {
      content: this.selectedAccountContext.getSecurejoinQrCode(chatId),
      svg: this.selectedAccountContext.getSecurejoinQrCodeSVG(chatId),
    }
  }

  leaveGroup(chatId: number) {
    log.debug(`action - leaving chat ${chatId}`)
    this.selectedAccountContext.removeContactFromChat(
      chatId,
      C.DC_CONTACT_ID_SELF
    )
  }

  setName(chatId: number, name: string) {
    return this.selectedAccountContext.setChatName(chatId, name)
  }

  modifyGroup(
    chatId: number,
    name: string,
    image: string | undefined,
    members: number[] | null
  ) {
    log.debug('action - modify group', { chatId, name, image, members })
    this.selectedAccountContext.setChatName(chatId, name)
    const chat = this.selectedAccountContext.getChat(chatId)
    if (!chat) {
      throw new Error('chat is undefined, this should not happen')
    }
    if (typeof image !== 'undefined' && chat.getProfileImage() !== image) {
      this.selectedAccountContext.setChatProfileImage(chatId, image || '')
    }

    if (members !== null) {
      const previousMembers = [
        ...this.selectedAccountContext.getChatContacts(chatId),
      ]
      const remove = previousMembers.filter(m => !members.includes(m))
      const add = members.filter(m => !previousMembers.includes(m))

      remove.forEach(id =>
        this.selectedAccountContext.removeContactFromChat(chatId, id)
      )
      add.forEach(id =>
        this.selectedAccountContext.addContactToChat(chatId, id)
      )
    }
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

  /**
   * @returns id of the created chat
   */
  createBroadcastList() {
    return this.selectedAccountContext.createBroadcastList()
  }

  delete(chatId: number) {
    log.debug(`action - deleting chat ${chatId}`)
    this.selectedAccountContext.deleteChat(chatId)
    this.controller.emit('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', chatId)
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
    this.controller.emit('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', chatId)
    const count = this.controller.chatList.getGeneralFreshMessageCounter()
    app.setBadgeCount(count)
    set_has_unread(count !== 0)
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

  getNextMedia(messageId: number, direction: 1 | -1): number {
    // workaround to get gifs and images into the same media list
    let additional_view_type = 0
    const viewType = this.selectedAccountContext
      .getMessage(messageId)
      ?.getViewType().viewType
    if (viewType === C.DC_MSG_IMAGE) {
      additional_view_type = C.DC_MSG_GIF
    } else if (viewType === C.DC_MSG_GIF) {
      additional_view_type = C.DC_MSG_IMAGE
    }

    return this.selectedAccountContext._getNextMedia(
      messageId,
      direction,
      0,
      additional_view_type,
      0
    )
  }
}
