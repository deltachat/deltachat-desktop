import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'

const log = getLogger('main/deltachat/chat')
export default class DCChat extends SplitOut {
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

  getChatEphemeralTimer(chatId: number) {
    return this.selectedAccountContext.getChatEphemeralTimer(chatId)
  }

  setChatEphemeralTimer(chatId: number, timer: number) {
    return this.selectedAccountContext.setChatEphemeralTimer(chatId, timer)
  }
}
