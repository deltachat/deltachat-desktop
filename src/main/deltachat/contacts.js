const DeltaChat = require('deltachat-node')
const log = require('../../shared/logger').getLogger('main/deltachat/contacts')

const SplitOut = require('./splitout')
module.exports = class DCContacts extends SplitOut {
  unblockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, false)
    const name = contact.getNameAndAddress()
    log.info(`Unblocked contact ${name} (id = ${contactId})`)
  }

  blockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    log.debug(`Blocked contact ${name} (id = ${contactId})`)
  }

  acceptContactRequest ({ messageId, contactId }) {
    log.info(`chat with dead drop ${contactId}:${messageId}`)
    const contact = this._dc.getContact(contactId)
    const address = contact.getAddress()
    this._dc.createContact('', address)
    log.info(`Added contact ${contact.getNameAndAddress()}`)
    const chatId = this._dc.createChatByMessageId(messageId)

    if (chatId) this._controller.chatList.updateChatList()
    return chatId
  }

  createContact (name, email) {
    if (!DeltaChat.maybeValidAddr(email)) {
      this._controller.emit('error', this._controller.translate('bad_email_address'))
      return null
    }
    return this._dc.createContact(name || '', email)
  }

  createChatByContactId (contactId) {
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
      this._dc.archiveChat(chatId, 0)
    }
    this._controller.chatList.updateChatList()
    this._controller.chatList.selectChat(chatId)
    return chatId
  }

  getContact (contactId) {
    return this._dc.getContact(contactId).toJson()
  }

  markNoticedContact (contactId) {
    return this._dc.markNoticedContact(contactId)
  }
}
