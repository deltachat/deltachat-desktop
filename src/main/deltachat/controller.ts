import DeltaChat, { C, DeltaChat as DeltaChatNode } from 'deltachat-node'
import { app as rawApp } from 'electron'
import { EventEmitter } from 'events'
import { getLogger } from '../../shared/logger'
import { JsonContact, AppState } from '../../shared/shared-types'
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

import { VERSION, BUILD_TIMESTAMP } from '../../shared/build-info'
import { Timespans, DAYS_UNTIL_UPDATE_SUGGESTION } from '../../shared/constants'
import { Context } from 'deltachat-node/dist/context'
import path, { join } from 'path'
import { existsSync } from 'fs'
import { stat, rename, readdir } from 'fs/promises'

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
  cwd: string = undefined
  dc: DeltaChat = undefined
  selectedAccountContext: Context = undefined
  selectedAccountId: number | null = null
  selectedChatId: number | null = null

  get accountDir() {
    return join(this.selectedAccountContext.getBlobdir(), '..')
  }

  ready = false // used for the about screen
  _sendStateToRenderer: () => void
  constructor(cwd: string) {
    super()
    this.cwd = cwd

    this.onAll = this.onAll.bind(this)
    this.onChatlistUpdated = this.onChatlistUpdated.bind(this)
    this.onMsgsChanged = this.onMsgsChanged.bind(this)
    this.onIncomingMsg = this.onIncomingMsg.bind(this)
    this.onChatModified = this.onChatModified.bind(this)
  }

  async init() {
    this._resetState()

    await this.migrateToAccountsApiIfNeeded()

    setInterval(
      // If the dc is always on
      this.hintUpdateIfNessesary.bind(this),
      Timespans.ONE_DAY_IN_SECONDS * 1000
    )

    log.debug('Initiating DeltaChatNode')
    this.dc = new DeltaChatNode(this.cwd, 'deltachat-desktop')

    log.debug('Starting event handler')
    this.registerEventHandler(this.dc)
  }

  async migrateToAccountsApiIfNeeded() {
    const new_accounts_format = existsSync(path.join(this.cwd, 'accounts.toml'))

    if (new_accounts_format) return

    log.info(
      'migrateToAccountsApiIfNeeded: found old accounts format, we need to migrate.'
    )

    const path_accounts_old = join(this.cwd, '..', 'accounts_old')

    // this is the same as this.cwd, but for clarity added ../accounts
    const path_accounts = join(this.cwd, '..', 'accounts')

    // First, rename accounts folder to accounts_old
    await rename(path_accounts, path_accounts_old)

    // Next, open temporary dc instance
    const tmp_dc = new DeltaChat(path_accounts)
    this.registerEventHandler(tmp_dc)

    // Next, iterate over all folders in accounts_old
    for (const entry of await readdir(path_accounts_old)) {
      const stat_result = await stat(join(path_accounts_old, entry))
      if (!stat_result.isDirectory()) continue

      const path_dbfile = path.join(path_accounts_old, entry, 'db.sqlite')
      if (!existsSync(path_dbfile)) {
        log.warn(
          'migrateToAccountsApiIfNeeded: found an old accounts folder without a db.sqlite file, skipping'
        )
        continue
      }

      const account_id = tmp_dc.migrateAccount(path_dbfile)
      if (account_id == 0) {
        log.error(
          `migrateToAccountsApiIfNeeded: Failed to migrate account at path "${path_dbfile}"`
        )
      }
    }

    tmp_dc.close()
    // Clear some settings that we cant migrate
    app.saveState({
      saved: {
        ...app.state.saved,
        lastAccount: -1,
        lastChats: {},
      },
    })
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
          'This is not allowed and will normally produce a crash of electron'
      )
      return
    }
    if (!payload) payload = null
    mainWindow.send(eventType, payload)
  }

  translate(
    ...args: Parameters<import('../../shared/localize').getMessageFunction>
  ) {
    return (app as any).translate(...args)
  }

  onAll(event: string, accountId: number, data1: any, data2: any) {
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

    this.emit('ALL', event, accountId, data1, data2)
    this.emit(event, accountId, data1, data2)

    if (accountId === this.selectedAccountId) {
      this.sendToRenderer(event, [data1, data2])
    }
  }

  onMsgsChanged(accountId: number, chatId: number, _msgId: number) {
    this.onChatlistUpdated()
    // chatListItem listens to this in the frontend
    this.chatList.onChatModified(chatId)
  }

  onIncomingMsg(accountId: number, chatId: number, msgId: number) {
    maybeMarkSeen(chatId, msgId)
    this.onChatlistUpdated()
    // chatListItem listens to this in the frontend
    this.chatList.onChatModified(chatId)
  }

  onChatModified(accountId: number, chatId: number, _msgId: number) {
    this.onChatlistUpdated()
    // chatListItem listens to this in the frontend
    this.chatList.onChatModified(chatId)
  }

  registerEventHandler(dc: DeltaChat) {
    dc.startEvents()
    dc.on('ALL', (...args) => this.onAll.bind(this)(...args))
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
    if (!this.selectedAccountContext) {
      const { dc, context } = DeltaChat.newTemporary()

      this.registerEventHandler(dc)
      const checkQr = await context.checkQrCode(qrCode)
      this.unregisterEventHandler(dc)
      dc.close()

      return checkQr
    }
    return this.selectedAccountContext.checkQrCode(qrCode)
  }

  async joinSecurejoin(qrCode: string) {
    return await this.selectedAccountContext.joinSecurejoin(qrCode)
  }

  stopOngoingProcess() {
    this.selectedAccountContext.stopOngoingProcess()
  }

  // ToDo: Deprecated, use contacts.getContact
  _getContact(id: number) {
    const contact = this.selectedAccountContext.getContact(id).toJson()
    return { ...contact }
  }

  // ToDo: move to contacts.
  _blockedContacts(): JsonContact[] {
    if (!this.selectedAccountContext) return []
    return this.selectedAccountContext
      .getBlockedContacts()
      .map(this._getContact.bind(this))
  }

  // ToDo: move to contacts.
  getContacts2(listFlags: number, queryStr: string) {
    const distinctIds = Array.from(
      new Set(this.selectedAccountContext.getContacts(listFlags, queryStr))
    )
    const contacts = distinctIds.map(this._getContact.bind(this))
    return contacts
  }

  setProfilePicture(newImage: string) {
    this.selectedAccountContext.setConfig('selfavatar', newImage)
  }

  getProfilePicture() {
    return this.selectedAccountContext
      .getContact(C.DC_CONTACT_ID_SELF)
      .getProfileImage()
  }

  getInfo() {
    if (this.selectedAccountContext) {
      return this.selectedAccountContext.getInfo()
    } else {
      return DeltaChat.newTemporary().context.getInfo()
    }
  }

  getProviderInfo(email: string) {
    return DeltaChatNode.getProviderFromEmail(email)
  }

  checkValidEmail(email: string) {
    return DeltaChatNode.maybeValidAddr(email)
  }

  hintUpdateIfNessesary() {
    if (
      this.selectedAccountContext &&
      Date.now() >
        Timespans.ONE_DAY_IN_SECONDS * DAYS_UNTIL_UPDATE_SUGGESTION * 1000 +
          BUILD_TIMESTAMP
    ) {
      this.selectedAccountContext.addDeviceMessage(
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
    this.selectedChatId = null
  }
}
