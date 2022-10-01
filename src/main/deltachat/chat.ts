import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'

const log = getLogger('main/deltachat/chat')
export default class DCChat extends SplitOut {
  getQrCode(chatId = 0) {
    return this.selectedAccountContext.getSecurejoinQrCode(chatId)
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

  getChatContacts(chatId: number) {
    return this.selectedAccountContext.getChatContacts(chatId)
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
