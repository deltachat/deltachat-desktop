const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const EventEmitter = require('events').EventEmitter
const log = require('../../logger').getLogger('main/deltachat')

/**
 * The Controller is the container for a deltachat instance
 */
class DeltaChatController extends EventEmitter {
  /**
   * Created and owned by ipc on the backend
   */
  constructor (cwd, saved) {
    super()
    this.cwd = cwd
    this._resetState()
    if (!saved) throw new Error('Saved settings are a required argument to DeltaChatController')
    this._saved = saved
    this.loadSplitOuts()
  }

  loadSplitOuts () {
    require('./login').bind(this)()
    require('./chatlist').bind(this)()
    require('./messagelist').bind(this)()
    require('./settings').bind(this)()
  }

  emit (event, ...args) {
    super.emit('ALL', event, ...args)
    super.emit(event, ...args)
  }

  logCoreEvent (event, payload) {
    log.debug('Core Event', event, payload)
  }

  getInfo () {
    if (this.ready === true) {
      return this._dc.getInfo()
    } else {
      return DeltaChat.getSystemInfo()
    }
  }


  initiateKeyTransfer (cb) {
    return this._dc.initiateKeyTransfer(cb)
  }

  continueKeyTransfer (messageId, setupCode, cb) {
    return this._dc.continueKeyTransfer(messageId, setupCode, cb)
  }

  createContact (name, email) {
    return this._dc.createContact(name, email)
  }

  chatWithContact (deadDrop) {
    log.info(`chat with dead drop ${deadDrop}`)
    const contact = this._dc.getContact(deadDrop.contact.id)
    const address = contact.getAddress()
    const name = contact.getName() || address.split('@')[0]
    this._dc.createContact(name, address)
    log.info(`Added contact ${name} (${address})`)
    const chatId = this._dc.createChatByMessageId(deadDrop.id)
    if (chatId) this.selectChat(chatId)
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
    this.selectChat(chatId)
    return chatId
  }

  getChatContacts (chatId) {
    return this._dc.getChatContacts(chatId)
  }

  modifyGroup (chatId, name, image, remove, add) {
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

  createGroupChat (verified, name, image, contactIds) {
    let chatId
    if (verified) chatId = this._dc.createVerifiedGroupChat(name)
    else chatId = this._dc.createUnverifiedGroupChat(name)
    this._dc.setChatProfileImage(chatId, image)
    contactIds.forEach(id => this._dc.addContactToChat(chatId, id))
    this.selectChat(chatId)
    return { chatId }
  }

  /**
   * Called when this controller is created and when current
   * locale changes
   */
  setCoreStrings (strings) {
    if (!this._dc) return

    this._dc.clearStringTable()
    Object.keys(strings).forEach(key => {
      this._dc.setStringTable(Number(key), strings[key])
    })

    this._render()
  }

  getQrCode (chatId = 0) {
    return this._dc.getSecurejoinQrCode(chatId)
  }


  setLocation (latitude, longitude, accuracy) {
    return this._dc.setLocation(latitude, longitude, accuracy)
  }

  getLocations (chatId, contactId, timestampFrom, timestampTo) {
    return this._dc.getLocations(chatId, contactId, timestampFrom, timestampTo)
  }

  setDraft (chatId, msgText) {
    let msg = this._dc.messageNew()
    msg.setText(msgText)

    this._dc.setDraft(chatId, msg)
  }

  /**
   * Returns the state in json format
   */
  render () {
    let selectedChatId = this._selectedChatId
    let showArchivedChats = this._showArchivedChats

    let chatList = this._chatList(showArchivedChats)
    let selectedChat = this._selectedChat(showArchivedChats, chatList, selectedChatId)

    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready,
      blockedContacts: this._blockedContacts(),
      showArchivedChats,
      chatList,
      selectedChat
    }
  }

  _integerToHexColor (integerColor) {
    return '#' + integerColor.toString(16)
  }



  _blockedContacts () {
    if (!this._dc) return []
    return this._dc.getBlockedContacts().map(id => {
      return this._dc.getContact(id).toJson()
    })
  }

  getContacts (listFlags, queryStr) {
    const distinctIds = Array.from(new Set(this._dc.getContacts(listFlags, queryStr)))
    return distinctIds.map(id => {
      return this._dc.getContact(id).toJson()
    })
  }

  contactRequests () {
    this.selectChat(C.DC_CHAT_ID_DEADDROP)
  }

  getEncrInfo (contactId) {
    return this._dc.getContactEncryptionInfo(contactId)
  }


  isGroupChat (chat) {
    return [
      C.DC_CHAT_TYPE_GROUP,
      C.DC_CHAT_TYPE_VERIFIED_GROUP
    ].includes(chat && chat.type)
  }

  /**
   * Internal
   * Reset state related to login
   */
  _resetState () {
    this.ready = false
    this.configuring = false
    this.credentials = { addr: '' }
    this._selectedChatId = null
    this._showArchivedChats = false
    this._pages = 1
    this._query = ''
  }
}


module.exports = DeltaChatController
