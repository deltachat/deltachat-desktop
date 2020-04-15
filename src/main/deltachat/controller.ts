import DeltaChat, { C, DeltaChat as DeltaChatNode } from 'deltachat-node'
import { app } from 'electron'
import { EventEmitter } from 'events'
import { getLogger } from '../../shared/logger'
import { LocalSettings, JsonContact } from '../../shared/shared-types'
import { integerToHexColor } from '../../shared/util'
import { maybeMarkSeen } from '../markseenFix'
import * as mainWindow from '../windows/main'
import DCAutocrypt from './autocrypt'
import DCBackup from './backup'
import DCChat from './chat'
import DCChatList from './chatlist'
import DCContacts from './contacts'
import DCContext from './context'
import DCLocations from './locations'
import DCLoginController from './login'
import DCMessageList from './messagelist'
import DCSettings from './settings'
import DCStickers from './stickers'

const eventStrings = require('deltachat-node/events')
const log = getLogger('main/deltachat')
const logCoreEv = getLogger('core/event')

/**
 * DeltaChatController
 *
 * - proxy for a deltachat instance
 * - sends events to renderer
 * - handles events from renderer
 */
export default class DeltaChatController extends EventEmitter {
  /**
   * Created and owned by ipc on the backend
   */
  _dc: DeltaChat = undefined
  accountDir: string
  configuring = false
  updating = false
  ready = false
  credentials = { addr: '' }
  _selectedChatId: number | null = null
  _showArchivedChats = false
  _pages = 0
  _query = ''
  _sendStateToRenderer: () => void
  constructor(public cwd: string, saved: LocalSettings) {
    super()
    this._resetState()
    if (!saved)
      throw new Error(
        'Saved settings are a required argument to DeltaChatController'
      )
  }

  readonly autocrypt = new DCAutocrypt(this)
  readonly backup = new DCBackup(this)
  readonly chatList = new DCChatList(this)
  readonly contacts = new DCContacts(this)
  readonly chat = new DCChat(this)
  readonly locations = new DCLocations(this)
  readonly loginController = new DCLoginController(this)
  readonly messageList = new DCMessageList(this)
  readonly settings = new DCSettings(this)
  readonly stickers = new DCStickers(this)
  readonly context = new DCContext(this)

  logCoreEvent(event: any, data1: any, data2: any) {
    if (!isNaN(event)) {
      event = eventStrings[event]
    }

    if (data1 === 0) data1 = ''

    if (event === 'DC_EVENT_INFO') {
      logCoreEv.info(event, data1, data2)
    } else {
      logCoreEv.debug(event, data1, data2)
    }
  }

  /**
   * @param {string} methodName
   */
  __resolveNestedMethod(self: DeltaChatController, methodName: string) {
    const parts = methodName.split('.')
    if (parts.length > 2) {
      const message =
        'Resolving of nested method name failed: Too many parts, only two allowed: ' +
        methodName
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
  async callMethod(_evt: any, methodName: string, args: any[] = []) {
    const method =
      methodName.indexOf('.') !== -1
        ? this.__resolveNestedMethod(this, methodName)
        : (methodName => {
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
      log.error(
        `Error calling ${methodName}(${args.join(', ')}):\n ${err.stack}`
      )
    }
    return returnValue
  }

  sendToRenderer(eventType: string, payload?: any) {
    log.debug('sendToRenderer: ' + eventType, payload)
    mainWindow.send('ALL', eventType, payload)
    if (!eventType) {
      log.error(
        'Tried to send an undefined event to the renderer.\n' +
          'This is not allowed and will normaly produce a crash of electron'
      )
      return
    }
    mainWindow.send(eventType, payload)
  }

  translate(
    ...args: Parameters<import('../../shared/localize').getMessageFunction>
  ) {
    return (app as any).translate(...args)
  }

  checkPassword(password: string) {
    return password === this.settings.getConfig('mail_pw')
  }

  registerEventHandler(dc: DeltaChat) {
    dc.on('ALL', (event: any, data1: any, data2: any) => {
      if (!isNaN(event)) {
        event = eventStrings[event]
      }
      this.logCoreEvent(event, data1, data2)
      if (!event || event === 'DC_EVENT_INFO') return
      this.sendToRenderer(event, [data1, data2])
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

    dc.on('DC_EVENT_MSG_FAILED', (chatId: number, msgId: number) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId: number, msgId: number) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_MSG_READ', (chatId: number, msgId: number) => {
      this.onChatListItemChanged(chatId)
    })

    dc.on('DC_EVENT_WARNING', (warning: any) => {
      log.warn(warning)
    })

    const onError = (error: any) => {
      this.emit('error', error)
      log.error(error)
    }

    dc.on('DC_EVENT_ERROR', (error: any) => {
      onError(error)
    })

    dc.on('DC_EVENT_ERROR_NETWORK', (_first: any, error: any) => {
      onError(error)
      if (this.configuring) {
        this.onLoginFailure()
      }
    })

    dc.on('DC_EVENT_ERROR_SELF_NOT_IN_GROUP', (error: any) => {
      onError(error)
    })

    dc.on('DC_EVENT_CONFIGURE_PROGRESS', (progress: string) => {
      if (Number(progress) === 0) {
        // login failed
        this.onLoginFailure()
        this.sendToRenderer('DC_EVENT_CONFIGURE_FAILED')
      }
    })
  }

  onLoginFailure() {
    if (this.updating) {
      // error when updating login credentials when being logged in
      this.sendToRenderer('DC_EVENT_LOGIN_FAILED')
      this.configuring = false
      this.updating = false
    } else {
      this.loginController.logout()
    }
  }

  onChatListChanged() {
    this.sendToRenderer('DD_EVENT_CHATLIST_CHANGED', {})
  }

  onChatListItemChanged(chatId: number) {
    this.sendToRenderer('DD_EVENT_CHATLIST_ITEM_CHANGED', { chatId })
  }

  updateBlockedContacts() {
    const blockedContacts = this._blockedContacts()
    this.sendToRenderer('DD_EVENT_BLOCKED_CONTACTS_UPDATED', {
      blockedContacts,
    })
  }

  /**
   * Returns the state in json format
   */
  getState() {
    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready,
    }
  }

  // ToDo: Deprecated, use contacts.getContact
  getContact(id: number) {
    const contact = this._dc.getContact(id).toJson()
    return { ...contact, color: integerToHexColor(contact.color) }
  }

  // ToDo: move to contacts.
  _blockedContacts(): JsonContact[] {
    if (!this._dc) return []
    return this._dc.getBlockedContacts().map(this.getContact.bind(this))
  }

  // ToDo: move to contacts.
  getContacts2(listFlags: number, queryStr: string) {
    const distinctIds = Array.from(
      new Set(this._dc.getContacts(listFlags, queryStr))
    )
    const contacts = distinctIds.map(this.getContact.bind(this))
    return contacts
  }

  // ToDo: move to contacts.
  getContacts(listFlags: number, queryStr: string) {
    const contacts = this.getContacts2(listFlags, queryStr)
    this.sendToRenderer('DD_EVENT_CONTACTS_UPDATED', { contacts })
  }

  setProfilePicture(newImage: string) {
    this._dc.setConfig('selfavatar', newImage)
  }

  getProfilePicture() {
    return this._dc.getContact(C.DC_CONTACT_ID_SELF).getProfileImage()
  }

  getInfo() {
    if (this.ready === true) {
      return this._dc.getInfo()
    } else {
      return DeltaChatNode.getSystemInfo()
    }
  }

  getProviderInfo(email: string) {
    return DeltaChatNode.getProviderFromEmail(email)
  }

  /**
   * Internal
   * Reset state related to login
   */
  _resetState() {
    this.ready = false
    this.configuring = false
    this.credentials = { addr: '' }
    this._selectedChatId = null
    this._showArchivedChats = false
    this._pages = 0
    this._query = ''
  }
}
