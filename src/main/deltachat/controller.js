const C = require('deltachat-node/constants')
const DeltaChatNode = require('deltachat-node')
const eventStrings = require('deltachat-node/events')
const EventEmitter = require('events').EventEmitter
const log = require('../../logger').getLogger('main/deltachat', true)
const logCoreEv = require('../../logger').getLogger('core/event', true)
const windows = require('../windows')
const { app } = require('electron')

const { maybeMarkSeen } = require('../markseenFix')

const { integerToHexColor } = require('./util')

/**
 * @typedef {import('deltachat-node')} DeltaChat
 */
const DCAutocrypt = require('./autocrypt')
const DCBackup = require('./backup')
const DCChatList = require('./chatlist')
const DCMessageList = require('./messagelist')
const DCLocations = require('./locations')
const DCLoginController = require('./login')
const DCSettings = require('./settings')
const DCStickers = require('./stickers')
const DCChat = require('./chat')
const DCContacts = require('./contacts')

/**
 * DeltaChatController
 *
 * - proxy for a deltachat instance
 * - sends events to renderer
 * - handles events from renderer
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
    /**
     * @type {DeltaChat}
     */
    this._dc = undefined

    this.__private = {
      autocrypt: new DCAutocrypt(this),
      backup: new DCBackup(this),
      chatList: new DCChatList(this),
      contacts: new DCContacts(this),
      chat: new DCChat(this),
      locations: new DCLocations(this),
      loginController: new DCLoginController(this),
      messageList: new DCMessageList(this),
      settings: new DCSettings(this),
      stickers: new DCStickers(this)
    }
  }

  get autocrypt () {
    return this.__private.autocrypt
  }

  get backup () {
    return this.__private.backup
  }

  get chatList () {
    return this.__private.chatList
  }

  get contacts () {
    return this.__private.contacts
  }

  get chat () {
    return this.__private.chat
  }

  get locations () {
    return this.__private.locations
  }

  get loginController () {
    return this.__private.loginController
  }

  get messageList () {
    return this.__private.messageList
  }

  get settings () {
    return this.__private.settings
  }

  get stickers () {
    return this.__private.stickers
  }

  logCoreEvent (event, data1, data2) {
    if (!isNaN(event)) {
      event = eventStrings[event]
    }

    if (data1 === 0) data1 = ''

    logCoreEv.debug(event, data1, data2)
  }

  /**
   * @param {string} methodName
   */
  __resolveNestedMethod (self, methodName) {
    const parts = methodName.split('.')
    if (parts.length > 2) {
      const message = 'Resolving of nested method name failed: Too many parts, only two allowed: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    const scope = self[parts[0]]
    if (typeof scope === 'undefined') {
      const message = 'Resolving of nested method name failed: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    const method = scope[parts[1]]
    if (typeof method !== 'function') {
      const message = '(nested) Method is not of type function: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    return method.bind(scope)
  }

  /**
   *
   * @param {*} evt
   * @param {string} methodName
   * @param {*} args
   */
  async callMethod (evt, methodName, args) {
    const method = methodName.indexOf('.') !== -1 ? this.__resolveNestedMethod(this, methodName)
      : ((methodName) => {
        const method = this[methodName]
        if (typeof method !== 'function') {
          const message = 'Method is not of type function: ' + methodName
          log.error(message)
          throw new Error(message)
        }
        return method.bind(this)
      })(methodName)

    let returnValue
    try {
      returnValue = await method(...args)
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
    if (!eventType) {
      log.error('Tried to send an undefined event to the renderer.\n' +
      'This is not allowed and will normaly produce a crash of electron')
      return
    }
    windows.main.send(eventType, payload)
  }

  translate (key, substitutions, opts) {
    return app.translate(key, substitutions, opts)
  }

  checkPassword (password) {
    return password === this.settings.getConfig('mail_pw')
  }

  registerEventHandler (dc) {
    dc.on('ALL', (event, ...args) => {
      if (!isNaN(event)) {
        event = eventStrings[event]
      }
      this.logCoreEvent(event, ...args)
      if (!event || event === 'DC_EVENT_INFO') return
      this.sendToRenderer(event, ...args)
    })

    dc.on('DD_EVENT_CHATLIST_UPDATED', this.onChatListChanged.bind(this))

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_MSGS_CHANGED')
      this.chatList.onChatModified(chatId)
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      maybeMarkSeen(chatId, msgId)
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.onMessageUpdate(chatId, msgId, 'DC_EVENT_INCOMING_MSG')
      this.chatList.onChatModified(chatId)
    })

    dc.on('DC_EVENT_CHAT_MODIFIED', (chatId, msgId) => {
      this.onChatListChanged(chatId)
      this.onChatListItemChanged(chatId)
      this.chatList.onChatModified(chatId)
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
    this.sendToRenderer('DD_EVENT_MSG_UPDATE', { chatId, messageObj: this.messageList.messageIdToJson(msgId), eventType })
  }

  updateBlockedContacts () {
    const blockedContacts = this._blockedContacts()
    this.sendToRenderer('DD_EVENT_BLOCKED_CONTACTS_UPDATED', { blockedContacts })
  }

  /**
   * Returns the state in json format
   */
  getState () {
    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready
    }
  }

  getContact (id) {
    const contact = this._dc.getContact(id).toJson()
    contact.color = integerToHexColor(contact.color)
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
    this.chatList.selectChat(C.DC_CHAT_ID_DEADDROP)
  }

  getInfo () {
    if (this.ready === true) {
      return this._dc.getInfo()
    } else {
      return DeltaChatNode.getSystemInfo()
    }
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
