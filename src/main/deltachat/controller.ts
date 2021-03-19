import DeltaChat, { C, DeltaChat as DeltaChatNode } from 'deltachat-node'
import { app as rawApp } from 'electron'
import { EventEmitter } from 'events'
import { getLogger } from '../../shared/logger'
import { JsonContact, Credentials, AppState } from '../../shared/shared-types'
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
import DCBurnerAccounts from './burnerAccounts'
import { ExtendedAppMainProcess } from '../types'
import Extras from './extras'
import { EventId2EventName as eventStrings } from 'deltachat-node/dist/constants'

import { VERSION, BUILD_TIMESTAMP } from '../../shared/build-info'
import { Timespans, DAYS_UNTIL_UPDATE_SUGGESTION } from '../../shared/constants'
import tempy from 'tempy'

const app = rawApp as ExtendedAppMainProcess
const log = getLogger('main/deltachat')
const logCoreEvent = getLogger('core/event')

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
  ready = false // used for the about screen
  credentials: Credentials = { addr: '', mail_pw: '' }
  _selectedChatId: number | null = null
  _showArchivedChats = false
  _pages = 0
  _query = ''
  _sendStateToRenderer: () => void
  constructor(public cwd: string) {
    super()
    this._resetState()
    setInterval(
      // If the dc is allways on
      this.hintUpdateIfNessesary.bind(this),
      Timespans.ONE_DAY_IN_SECONDS * 1000
    )

    this.onAll = this.onAll.bind(this)
    this.onChatlistUpdated = this.onChatlistUpdated.bind(this)
    this.onMsgsChanged = this.onMsgsChanged.bind(this)
    this.onIncomingMsg = this.onIncomingMsg.bind(this)
    this.onChatModified = this.onChatModified.bind(this)
  }

  readonly autocrypt = new DCAutocrypt(this)
  readonly backup = new DCBackup(this)
  readonly chatList = new DCChatList(this)
  readonly contacts = new DCContacts(this)
  readonly chat = new DCChat(this)
  readonly locations = new DCLocations(this)
  readonly login = new DCLoginController(this)
  readonly messageList = new DCMessageList(this)
  readonly settings = new DCSettings(this)
  readonly stickers = new DCStickers(this)
  readonly context = new DCContext(this)
  readonly burnerAccounts = new DCBurnerAccounts(this)
  readonly extras = new Extras(this)

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
      throw err
    }
    return returnValue
  }

  sendToRenderer(eventType: string, payload?: any) {
    log.debug('sendToRenderer eventType: ' + eventType)
    //log.debug('sendToRenderer: ' + eventType, payload)
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

  onAll(_event: any, data1: any, data2: any) {
    const event: string = !isNaN(_event) ? eventStrings[_event] : String(_event)

    if (event === 'DC_EVENT_WARNING') {
      logCoreEvent.warn(event, data1, data2)
    } else if (event === 'DC_EVENT_INFO') {
      logCoreEvent.info(event, data1, data2)
    } else if (event.startsWith('DC_EVENT_ERROR')) {
      logCoreEvent.error(event, data1, data2)
    } else if (app.rc['log-debug']) {
      // in debug mode log all core events
      logCoreEvent.debug(event, data1, data2)
    }

    this.sendToRenderer(event, [data1, data2])
  }

  onMsgsChanged(chatId: number, _msgId: number) {
    this.onChatlistUpdated()
    // chatListItem listens to this in the frontend
    this.chatList.onChatModified(chatId)
  }

  onIncomingMsg(chatId: number, msgId: number) {
    maybeMarkSeen(chatId, msgId)
    this.onChatlistUpdated()
    // chatListItem listens to this in the frontend
    this.chatList.onChatModified(chatId)
  }

  onChatModified(chatId: number, _msgId: number) {
    this.onChatlistUpdated()
    // chatListItem listens to this in the frontend
    this.chatList.onChatModified(chatId)
  }

  registerEventHandler(dc: DeltaChat) {
    dc.on('ALL', this.onAll)
    dc.on('DD_EVENT_CHATLIST_UPDATED', this.onChatlistUpdated)
    dc.on('DC_EVENT_MSGS_CHANGED', this.onMsgsChanged)
    dc.on('DC_EVENT_INCOMING_MSG', this.onIncomingMsg)
    dc.on('DC_EVENT_CHAT_MODIFIED', this.onChatModified)
  }

  unregisterEventHandler(dc: DeltaChat) {
    dc.removeListener('ALL', this.onAll)
    dc.removeListener('DD_EVENT_CHATLIST_UPDATED', this.onChatlistUpdated)
    dc.removeListener('DC_EVENT_MSGS_CHANGED', this.onMsgsChanged)
    dc.removeListener('DC_EVENT_INCOMING_MSG', this.onIncomingMsg)
    dc.removeListener('DC_EVENT_CHAT_MODIFIED', this.onChatModified)
  }

  onChatlistUpdated() {
    this.sendToRenderer('DD_EVENT_CHATLIST_CHANGED', {})
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
  getState(): AppState {
    return {
      saved: app.state.saved,
      logins: app.state.logins,
    }
  }

  async checkQrCode(qrCode: string) {
    if (!this._dc) {
      const dc = new DeltaChat()
      this.registerEventHandler(dc)
      await dc.open(tempy.directory())
      const checkQr = await dc.checkQrCode(qrCode)
      this.unregisterEventHandler(dc)
      dc.close()

      return checkQr
    }
    return this._dc.checkQrCode(qrCode)
  }

  async joinSecurejoin(qrCode: string) {
    return await this._dc.joinSecurejoin(qrCode)
  }

  stopOngoingProcess() {
    this._dc.stopOngoingProcess()
  }

  // ToDo: Deprecated, use contacts.getContact
  _getContact(id: number) {
    const contact = this._dc.getContact(id).toJson()
    return { ...contact }
  }

  // ToDo: move to contacts.
  _blockedContacts(): JsonContact[] {
    if (!this._dc) return []
    return this._dc.getBlockedContacts().map(this._getContact.bind(this))
  }

  // ToDo: move to contacts.
  getContacts2(listFlags: number, queryStr: string) {
    const distinctIds = Array.from(
      new Set(this._dc.getContacts(listFlags, queryStr))
    )
    const contacts = distinctIds.map(this._getContact.bind(this))
    return contacts
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

  hintUpdateIfNessesary() {
    if (
      this._dc &&
      Date.now() >
        Timespans.ONE_DAY_IN_SECONDS * DAYS_UNTIL_UPDATE_SUGGESTION * 1000 +
          BUILD_TIMESTAMP
    ) {
      this._dc.addDeviceMessage(
        `update-suggestion-${VERSION}`,
        `This build is over ${DAYS_UNTIL_UPDATE_SUGGESTION} days old - There might be a new version available. -> https://get.delta.chat`
      )
    }
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
