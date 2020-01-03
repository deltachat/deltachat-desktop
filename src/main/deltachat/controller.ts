import {ExtendedApp, Credentials } from '../../types'

import { EventEmitter } from 'events'
import { app } from 'electron'
import { maybeMarkSeen } from '../markseenFix'
import { integerToHexColor } from './util'

import DCAutocrypt from './autocrypt'
import DCBackup from './backup'
import DCChatList from './chatlist'
import DCMessageList from './messagelist'
import DCLocations from './locations'
import DCLoginController from './login'
import DCSettings from './settings'
import DCStickers from './stickers'
import DCChat from './chat'
import DCContacts from './contacts'
import DCContext from './context'
const { DeltaChat } = require('deltachat-node')

const C = require('deltachat-node/constants')
const eventStrings = require('deltachat-node/events')
const log = require('../../logger').getLogger('main/deltachat')
const logCoreEv = require('../../logger').getLogger('core/event')
const windows = require('../windows')

/**
 * DeltaChatController
 *
 * - proxy for a deltachat instance
 * - sends events to renderer
 * - handles events from renderer
 */
export default class DeltaChatController extends EventEmitter {

  cwd: string

  accountDir: string = ''

  configuring: boolean = false

  credentials: Credentials

  ready: boolean

  _dc: any

  __private: any

  _selectedChatId?: number
  _showArchivedChats: boolean = false
  _pages: number = 0
  _query: string = ''

  /**
   * Created and owned by ipc on the backend
   */
  constructor (cwd: string, saved: any) {
    super()
    this.cwd = cwd
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
      stickers: new DCStickers(this),
      context: new DCContext(this)
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

  get context () {
    return this.__private.context
  }

  logCoreEvent (event: number | string, data1?: any, data2?: any) {
    if (typeof event === 'number') {
      event = eventStrings[event]
    }

    if (data1 === 0) data1 = ''

    logCoreEv.debug(event, data1, data2)
  }

  /**
   * @param {string} methodName
   */
  __resolveNestedMethod (self: DeltaChatController, methodName: string) {
    const parts = methodName.split('.')
    if (parts.length > 2) {
      const message = 'Resolving of nested method name failed: Too many parts, only two allowed: ' + methodName
      log.error(message)
      throw new Error(message)
    }
    const scope = (self as any)[parts[0]]
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
  async callMethod (_evt: any, methodName: string, args: Array<any> = []) {
    const method = methodName.indexOf('.') !== -1 ? this.__resolveNestedMethod(this, methodName)
      : ((methodName) => {
        const method = (this as any)[methodName]
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
  sendToRenderer (eventType: string, payload?: Object) {
    log.debug('sendToRenderer: ' + eventType, payload)
    windows.main.send('ALL', eventType, payload)
    if (!eventType) {
      log.error('Tried to send an undefined event to the renderer.\n' +
      'This is not allowed and will normaly produce a crash of electron')
      return
    }
    windows.main.send(eventType, payload)
  }

  translate (key: string, substitutions?: Array<any>, opts?: any) {
    return (app as ExtendedApp).translate(key, substitutions, opts)
  }

  checkPassword (password: string) {
    return password === this.settings.getConfig('mail_pw')
  }

  registerEventHandler (dc: DeltaChatController) {
    dc.on('ALL', (event: string | number, ...args: any) => {
      if (typeof event === 'number') {
        event = eventStrings[event]
      }
      this.logCoreEvent(event, ...args)
      if (!event || event === 'DC_EVENT_INFO') return
      this.sendToRenderer(String(event), args)
    })

    dc.on('DD_EVENT_CHATLIST_UPDATED', this.onChatListChanged.bind(this))

    // TODO: move event handling to frontend store
    dc.on('DC_EVENT_MSGS_CHANGED', (chatId: number, msgId: number) => {
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.chatList.onChatModified(chatId)
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId: number, msgId: number) => {
      maybeMarkSeen(chatId, msgId)
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.chatList.onChatModified(chatId)
    })

    dc.on('DC_EVENT_CHAT_MODIFIED', (chatId: number, msgId: number) => {
      this.onChatListChanged()
      this.onChatListItemChanged(chatId)
      this.chatList.onChatModified(chatId)
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId: number) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId: number) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_MSG_READ', (chatId: number) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_WARNING', (warning: string) => {
      log.warn(warning)
    })

    const onError = (error: ErrorEvent) => {
      this.emit('error', error)
      log.error(error)
    }

    dc.on('DC_EVENT_ERROR', (error: ErrorEvent) => {
      onError(error)
    })

    dc.on('DC_EVENT_ERROR_NETWORK', (first: any, error: ErrorEvent) => {
      onError(error)
      if (this.configuring) {
        // error when updating login credentials when being logged in
        this.onLoginFailure()
      }
    })

    dc.on('DC_EVENT_ERROR_SELF_NOT_IN_GROUP', (error: ErrorEvent) => {
      onError(error)
    })

    dc.on('DC_EVENT_CONFIGURE_PROGRESS', (progress: number) => {
      if (Number(progress) === 0) { // login failed
        this.onLoginFailure()
      }
    })
  }

  onLoginFailure () {
    this.sendToRenderer('DC_EVENT_LOGIN_FAILED')
    this.loginController.logout()
  }

  onChatListChanged () {
    this.sendToRenderer('DD_EVENT_CHATLIST_CHANGED', {})
  }

  onChatListItemChanged (chatId: number) {
    this.sendToRenderer('DD_EVENT_CHATLIST_ITEM_CHANGED', { chatId })
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

  // ToDo: Deprecated, use contacts.getContact
  getContact (id: number): any {
    const contact = this._dc.getContact(id).toJson()
    contact.color = integerToHexColor(contact.color)
    return contact
  }

  // ToDo: move to contacts.
  _blockedContacts () {
    if (!this._dc) return []
    return this._dc.getBlockedContacts().map(this.getContact.bind(this))
  }

  // ToDo: move to contacts.
  getContacts2 (listFlags: Array<string>, queryStr: string) {
    const distinctIds = Array.from(new Set(this._dc.getContacts(listFlags, queryStr)))
    const contacts = distinctIds.map(this.getContact.bind(this))
    return contacts
  }

  // ToDo: move to contacts.
  getContacts (listFlags: Array<string>, queryStr: string) {
    const contacts = this.getContacts2(listFlags, queryStr)
    this.sendToRenderer('DD_EVENT_CONTACTS_UPDATED', { contacts })
  }

  setProfilePicture (newImage: string) {
    this._dc.setConfig('selfavatar', newImage)
  }

  getProfilePicture () {
    return this._dc.getContact(C.DC_CONTACT_ID_SELF).getProfileImage()
  }

  getInfo (): string {
    if (this.ready === true) {
      return this._dc.getInfo()
    } else {
      return DeltaChat.getSystemInfo()
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
