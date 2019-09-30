const C = require('deltachat-node/constants')
const eventStrings = require('deltachat-node/events')
const EventEmitter = require('events').EventEmitter
const log = require('../../logger').getLogger('main/deltachat')
const windows = require('../windows')
const { app } = require('electron')

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
    this.fullCwd = false
    this._resetState()
    if (!saved) throw new Error('Saved settings are a required argument to DeltaChatController')
    this.loadSplitOuts()
  }

  loadSplitOuts () {
    require('./autocrypt').bind(this)()
    require('./backup').bind(this)()
    require('./chatlist').bind(this)()
    require('./chatmethods').bind(this)()
    require('./locations').bind(this)()
    require('./login').bind(this)()
    require('./messagelist').bind(this)()
    require('./settings').bind(this)()
    require('./stickers').bind(this)()
  }

  logCoreEvent (event, data1, data2) {
    if (!isNaN(event)) {
      event = eventStrings[event]
    }

    if (data1 === 0) data1 = ''

    log.debug('Core Event', event, data1, data2)
  }

  async callMethod (evt, methodName, args) {
    if (typeof this[methodName] !== 'function') {
      const message = 'Method is not of type function: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    let returnValue
    try {
      returnValue = await this[methodName](...args)
    } catch (err) {
      log.error(`Error calling ${methodName}(${args.join(', ')}):\n ${err.stack}`)
    }
    return returnValue
  }

  /**
   * @param {string} eventType
   * @param {object} payload
   */
  sendToRenderer (eventType, payload) {
    log.debug('sendToRenderer: ' + eventType)
    windows.main.send('ALL', eventType, payload)
    windows.main.send(eventType, payload)
  }

  translate (txt) {
    return app.translate(txt)
  }

  checkPassword (password) {
    return password === this.getConfig('mail_pw')
  }

  registerEventHandler (dc) {
    dc.on('ALL', (event, ...args) => {
      if (!isNaN(event)) {
        event = eventStrings[event]
      }
      this.logCoreEvent(event, ...args)
      if (event === 'DC_EVENT_INFO') return
      this.sendToRenderer(event, ...args)
    })

    dc.on('DD_EVENT_CHATLIST_UPDATED', this.onChatListChanged.bind(this))

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSGS_CHANGED')
      this.onChatModified(chatId)
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_INCOMING_MSG')
      this.onChatModified(chatId)
    })

    dc.on('DC_EVENT_CHAT_MODIFIED', (chatId, msgId) => {
      this.onChatListChanged(chatId)
      this.onChatListItemChanged(chatId)
      this.onChatModified(chatId)
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId, msgId) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId, msgId) => {
      this.onChatListItemChanged(chatId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSG_DELIVERED')
    })

    dc.on('DC_EVENT_MSG_READ', (chatId, msgId) => {
      this.onChatListItemChanged(chatId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSG_READ')
    })

    dc.on('DC_EVENT_WARNING', (warning) => {
      log.warn(warning)
    })

    const onError = error => {
      this.emit('error', error)
      log.error(error)
    }

    dc.on('DC_EVENT_ERROR', (error) => {
      onError(error)
    })

    dc.on('DC_EVENT_ERROR_NETWORK', (first, error) => {
      onError(error)
    })

    dc.on('DC_EVENT_ERROR_SELF_NOT_IN_GROUP', (error) => {
      onError(error)
    })
  }

  onChatListChanged () {
    this.sendToRenderer('DD_EVENT_CHATLIST_CHANGED', {})
  }

  onChatListItemChanged (chatId) {
    this.sendToRenderer('DD_EVENT_CHATLIST_ITEM_CHANGED', { chatId })
  }

  /**
   *
   * @param {int} chatId
   * @param {int} msgId
   * @param {string} eventType
   */
  onMessageUpdate (chatId, msgId, eventType) {
    if (chatId === 0 || msgId === 0) return
    this.sendToRenderer('DD_EVENT_MSG_UPDATE', { chatId, messageObj: this.messageIdToJson(msgId), eventType })
  }

  updateBlockedContacts () {
    const blockedContacts = this._blockedContacts()
    this.sendToRenderer('DD_EVENT_BLOCKED_CONTACTS_UPDATED', { blockedContacts })
  }

  /**
   * Returns the state in json format
   */
  render () {
    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready
    }
  }

  _integerToHexColor (integerColor) {
    return '#' + integerColor.toString(16)
  }

  getContact (id) {
    const contact = this._dc.getContact(id).toJson()
    contact.color = this._integerToHexColor(contact.color)
    return contact
  }

  _blockedContacts () {
    if (!this._dc) return []
    return this._dc.getBlockedContacts().map(this.getContact.bind(this))
  }

  getContacts2 (listFlags, queryStr) {
    const distinctIds = Array.from(new Set(this._dc.getContacts(listFlags, queryStr)))
    const contacts = distinctIds.map(this.getContact.bind(this))
    return contacts
  }

  getContacts (listFlags, queryStr) {
    const contacts = this.getContacts2(listFlags, queryStr)
    this.sendToRenderer('DD_EVENT_CONTACTS_UPDATED', { contacts })
  }

  contactRequests () {
    this.selectChat(C.DC_CHAT_ID_DEADDROP)
  }

  getEncrInfo (contactId) {
    return this._dc.getContactEncryptionInfo(contactId)
  }

  getChatMedia (msgType1, msgType2) {
    if (!this._selectedChatId) return
    const mediaMessages = this._dc.getChatMedia(this._selectedChatId, msgType1, msgType2)
    return mediaMessages.map(this.messageIdToJson.bind(this))
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
    this._pages = 0
    this._query = ''
  }
}

module.exports = DeltaChatController
