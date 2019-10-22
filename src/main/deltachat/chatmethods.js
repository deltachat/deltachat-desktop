const DeltaChat = require('deltachat-node')
const log = require('../../logger').getLogger('main/deltachat/chatmethods', true)

function createContact (name, email) {
  if (!DeltaChat.maybeValidAddr(email)) {
    this.emit('error', this.translate('bad_email_address'))
    return null
  }
  return this._dc.createContact(name, email)
}

function unblockContact (contactId) {
  const contact = this._dc.getContact(contactId)
  this._dc.blockContact(contactId, false)
  const name = contact.getNameAndAddress()
  log.info(`Unblocked contact ${name} (id = ${contactId})`)
}

function blockContact (contactId) {
  const contact = this._dc.getContact(contactId)
  this._dc.blockContact(contactId, true)
  const name = contact.getNameAndAddress()
  log.debug(`Blocked contact ${name} (id = ${contactId})`)
}

function createChatByContactId (contactId) {
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
  this.chatList.updateChatList()
  this.chatList.selectChat(chatId)
  return chatId
}

module.exports = function () {
  this.createContact = createContact.bind(this)
  this.unblockContact = unblockContact.bind(this)
  this.blockContact = blockContact.bind(this)
  this.createChatByContactId = createChatByContactId.bind(this)

}
