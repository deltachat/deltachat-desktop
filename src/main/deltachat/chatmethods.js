const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/chatmethods')

function getInfo () {
  if (this.ready === true) {
    return this._dc.getInfo()
  } else {
    return DeltaChat.getSystemInfo()
  }
}

function createContact (name, email) {
  return this._dc.createContact(name, email)
}

function chatWithContact (deadDrop) {
  log.info(`chat with dead drop ${deadDrop}`)
  const contact = this._dc.getContact(deadDrop.contact.id)
  const address = contact.getAddress()
  const name = contact.getName() || address.split('@')[0]
  this._dc.createContact(name, address)
  log.info(`Added contact ${name} (${address})`)
  const chatId = this._dc.createChatByMessageId(deadDrop.id)
  if (chatId) this.selectChat(chatId)
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
  this.selectChat(chatId)
  return chatId
}

function getChatContacts (chatId) {
  return this._dc.getChatContacts(chatId)
}

function modifyGroup (chatId, name, image, remove, add) {
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

function deleteChat (chatId) {
  log.debug(`action - deleting chat ${chatId}`)
  this._dc.deleteChat(chatId)
  this.updateChatList()
}

function archiveChat (chatId, archive) {
  log.debug(`action - archiving chat ${chatId}`)
  this._dc.archiveChat(chatId, archive)
  this.updateChatList()
}

function createGroupChat (verified, name, image, contactIds) {
  let chatId
  if (verified) chatId = this._dc.createVerifiedGroupChat(name)
  else chatId = this._dc.createUnverifiedGroupChat(name)
  this._dc.setChatProfileImage(chatId, image)
  contactIds.forEach(id => this._dc.addContactToChat(chatId, id))
  this.selectChat(chatId)
  return { chatId }
}

function leaveGroup (chatId) {
  log.debug(`action - leaving chat ${chatId}`)
  this._dc.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
}

function getQrCode (chatId = 0) {
  return this._dc.getSecurejoinQrCode(chatId)
}

function getEncrInfo (contactId) {
  return this._dc.getContactEncryptionInfo(contactId)
}

function getChatMedia (msgType1, msgType2) {
  if (!this._selectedChatId) return
  const mediaMessages = this._dc.getChatMedia(this._selectedChatId, msgType1, msgType2)
  return mediaMessages.map(this.messageIdToJson.bind(this))
}

function _integerToHexColor (integerColor) {
  return '#' + integerColor.toString(16)
}

module.exports = function () {
  this.getInfo = getInfo.bind(this)
  this.createContact = createContact.bind(this)
  this.chatWithContact = chatWithContact.bind(this)
  this.unblockContact = unblockContact.bind(this)
  this.blockContact = blockContact.bind(this)
  this.createChatByContactId = createChatByContactId.bind(this)
  this.getChatContacts = getChatContacts.bind(this)
  this.modifyGroup = modifyGroup.bind(this)
  this.deleteChat = deleteChat.bind(this)
  this.archiveChat = archiveChat.bind(this)
  this.createGroupChat = createGroupChat.bind(this)
  this.leaveGroup = leaveGroup.bind(this)
  this.getQrCode = getQrCode.bind(this)
  this.getEncrInfo = getEncrInfo.bind(this)
  this.getChatMedia = getChatMedia.bind(this)
  this._integerToHexColor = _integerToHexColor.bind(this)
}
