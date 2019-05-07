const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const EventEmitter = require('events').EventEmitter
const path = require('path')
const log = require('../../logger').getLogger('main/deltachat')
const eventStrings = require('deltachat-node/events')
const windows = require('../windows')

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

  loadSplitOuts() {
    require('./login').bind(this)()
    require('./chatlist').bind(this)()
    require('./chatmethods').bind(this)()
    require('./messagelist').bind(this)()
    require('./settings').bind(this)()
    require('./locations').bind(this)()
    require('./autocrypt').bind(this)()
  }


  logCoreEvent (event, payload) {
    log.debug('Core Event', event, payload)
  }

  handleRendererEvent (evt, methodName, args) {
    if (typeof this[methodName] === 'function') {
      this[methodName](...args)
    }
  }

  sendToRenderer (evt, payload) {
    log.debug('sendToRenderer: ' + evt)
    windows.main.send(evt, payload)
  }


  checkPassword (password) {
    return password === this.getConfig('mail_pw')
  }



  /**
   * Returns the state in json format
   */
  render () {
    let selectedChatId = this._selectedChatId
    let showArchivedChats = this._showArchivedChats

    let { listCount, chatList } = this._chatList(showArchivedChats)
    let selectedChat = this._selectedChat(showArchivedChats, chatList, selectedChatId)

    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready,
      blockedContacts: this._blockedContacts(),
      showArchivedChats,
      totalChats: listCount,
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
    this._pages = 1
    this._chatListPages = 0
    this._query = ''
  }
}


module.exports = DeltaChatController
