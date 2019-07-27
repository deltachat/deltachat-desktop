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
    this._resetState()
    if (!saved) throw new Error('Saved settings are a required argument to DeltaChatController')
    this._saved = saved
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
  }

  logCoreEvent (event, data1, data2) {
    if (!isNaN(event)) {
      event = eventStrings[event]
    }

    if (data1 === 0) data1 = ''

    log.debug('Core Event', event, data1, data2)
  }

  /**
  * TODO: filter by a list of public/allowed methods
  *
  * @param evt
  * @param methodName
  * @param args
  */
  handleRendererEvent (evt, methodName, args) {
    if (typeof this[methodName] === 'function') {
      this[methodName](...args)
    }
  }

  /**
   * @param {string} eventType
   * @param {object} payload
   */
  sendToRenderer (eventType, payload) {
    log.debug('sendToRenderer: ' + eventType)
    windows.main.send(eventType, payload)
  }

  translate (txt) {
    return app.translate(txt)
  }

  /**
   *
   * @param {int} chatId
   * @param {int} msgId
   * @param {string} eventType
   */
  onMessageUpdate (chatId, msgId, eventType) {
    this.sendToRenderer('DD_EVENT_MSG_UPDATE', { chatId, messageObj: this.messageIdToJson(msgId), eventType })
  }

  checkPassword (password) {
    return password === this.getConfig('mail_pw')
  }

  registerEventHandler (dc) {
    dc.on('ALL', (event, data1, data2) => {
      this.logCoreEvent(event, data1, data2)
    })

    dc.on('DC_EVENT_CONFIGURE_PROGRESS', progress => {
      if (Number(progress) === 0) { // login failed
        this.emit('DC_EVENT_LOGIN_FAILED')
        this.logout()
      }
    })

    dc.on('DC_EVENT_IMEX_FILE_WRITTEN', (filename) => {
      this.emit('DC_EVENT_IMEX_FILE_WRITTEN', filename)
    })

    dc.on('DC_EVENT_IMEX_PROGRESS', (progress) => {
      this.emit('DC_EVENT_IMEX_PROGRESS', progress)
    })

    dc.on('DC_EVENT_CONFIGURE_PROGRESS', progress => {
      this.sendToRenderer('DC_EVENT_CONFIGURE_PROGRESS', progress)
    })

    dc.on('DC_EVENT_CONTACTS_CHANGED', (contactId) => {
      this.updateChatList()
      this.updateBlockedContacts()
    })

    dc.on('DC_EVENT_CHAT_MODIFIED', (chatId) => {
      log.debug('DC_EVENT_CHAT_MODIFIED: ' + chatId)
      this.updateChatList()
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      // Don't update if a draft changes
      if (msgId === 0) return
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSGS_CHANGED')
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      this.emit('DC_EVENT_INCOMING_MSG', chatId, msgId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_INCOMING_MSG')
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId, msgId) => {
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSG_DELIVERED')
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId, msgId) => {
      // TODO: what should we do here?
      this.sendToRenderer('DC_EVENT_MSG_FAILED', { chatId, msgId })
    })

    dc.on('DC_EVENT_MSG_READ', (chatId, msgId) => {
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSG_READ')
    })

    dc.on('DC_EVENT_LOCATION_CHANGED', (contactId) => {
      this.sendToRenderer('DC_EVENT_LOCATION_CHANGED', { contactId })
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

  _blockedContacts () {
    if (!this._dc) return []
    return this._dc.getBlockedContacts().map(id => {
      return this._dc.getContact(id).toJson()
    })
  }

  getContacts (listFlags, queryStr) {
    const distinctIds = Array.from(new Set(this._dc.getContacts(listFlags, queryStr)))
    const contacts = distinctIds.map(id => {
      return this._dc.getContact(id).toJson()
    })
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
