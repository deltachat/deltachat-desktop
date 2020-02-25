import DeltaChat from 'deltachat-node'
import logger from '../../shared/logger'

import SplitOut from './splitout'

const log = logger.getLogger('main/deltachat/contacts')

export default class DCContacts extends SplitOut {
  unblockContact(contactId: number) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, false)
    const name = contact.getNameAndAddress()
    log.info(`Unblocked contact ${name} (id = ${contactId})`)
  }

  blockContact(contactId: number) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    log.debug(`Blocked contact ${name} (id = ${contactId})`)
  }

  acceptContactRequest({
    messageId,
    contactId,
  }: {
    messageId: number
    contactId: number
  }) {
    log.info(`chat with dead drop ${contactId}:${messageId}`)
    const contact = this._dc.getContact(contactId)
    const address = contact.getAddress()
    this._dc.createContact('', address)
    log.info(`Added contact ${contact.getNameAndAddress()}`)
    const chatId = this._dc.createChatByMessageId(messageId)

    if (chatId) this._controller.chatList.updateChatList()
    return chatId
  }

  createContact(name: string, email: string) {
    if (!DeltaChat.maybeValidAddr(email)) {
      this._controller.emit(
        'error',
        this._controller.translate('bad_email_address')
      )
      return null
    }
    return this._dc.createContact(name || '', email)
  }

  createChatByContactId(contactId: number) {
    const contact = this._dc.getContact(contactId)
    if (!contact) {
      log.warn(`no contact could be found with id ${contactId}`)
      return 0
    }
    const chatId = this._dc.createChatByContactId(contactId)
    log.debug(`created chat ${chatId} with contact' ${contactId}`)
    const chat = this._dc.getChat(chatId)
    if (chat && chat.getArchived()) {
      log.debug('chat was archived, unarchiving it')
      this._dc.archiveChat(chatId, false)
    }
    this._controller.chatList.updateChatList()
    this._controller.chatList.selectChat(chatId)
    return chatId
  }

  getContact(contactId: number) {
    return this._dc.getContact(contactId).toJson()
  }

  markNoticedContact(contactId: number) {
    return this._dc.markNoticedContact(contactId)
  }

  getChatIdByContactId(contactId: number) {
    return this._dc.getChatIdByContactId(contactId)
  }

  /** Gets the direct message chat id with this contact and creates it if it doesn't exist yet */
  getDMChatId(contactId: number) {
    const existingChatId = this._dc.getChatIdByContactId(contactId)
    if (existingChatId !== 0) {
      return existingChatId
    }
    const newChatId = this._dc.createChatByContactId(contactId)
    if (newChatId !== 0) {
      return newChatId
    } else {
      throw new Error('Could not create chat with contact ' + contactId)
    }
  }
}
