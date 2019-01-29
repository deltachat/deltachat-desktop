const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const EventEmitter = require('events').EventEmitter
const path = require('path')
const log = require('../logger').getLogger('main/deltachat')

const PAGE_SIZE = 20

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
  }

  updateSettings (saved) {
    this._saved = saved
  }

  getPath (addr) {
    return path.join(this.cwd, Buffer.from(addr).toString('hex'))
  }

  logCoreEvent (event, payload) {
    log.debug('Core Event', event, payload)
  }

  login (credentials, render, coreStrings) {
    // Creates a separate DB file for each login
    const cwd = this.getPath(credentials.addr)
    log.info(`Using deltachat instance ${cwd}`)
    this._dc = new DeltaChat()
    var dc = this._dc
    this.credentials = credentials
    this._render = render

    this.setCoreStrings(coreStrings)

    dc.open(cwd, err => {
      if (err) throw err
      const onReady = () => {
        log.info('Ready')
        this.ready = true
        this.configuring = false
        this.emit('ready', this.credentials)
        log.info('dc_get_info', dc.getInfo())
        render()
      }
      if (!dc.isConfigured()) {
        dc.once('ready', onReady)
        this.configuring = true
        dc.configure(addServerFlags(credentials))
        render()
      } else {
        onReady()
      }
    })

    dc.on('ALL', (event, data1, data2) => {
      log.debug('ALL event', { event, data1, data2 })
    })

    dc.on('DC_EVENT_CONFIGURE_PROGRESS', progress => {
      this.logCoreEvent('DC_EVENT_CONFIGURE_PROGRESS', progress)
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

    dc.on('DC_EVENT_CONTACTS_CHANGED', (contactId) => {
      this.logCoreEvent('DC_EVENT_CONTACTS_CHANGED', contactId)
      render()
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      this.logCoreEvent('DC_EVENT_MSGS_CHANGED', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      this.emit('DC_EVENT_INCOMING_MSG', chatId, msgId)
      this.logCoreEvent('DC_EVENT_INCOMING_MSG', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId, msgId) => {
      this.logCoreEvent('EVENT msg delivered', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId, msgId) => {
      this.logCoreEvent('EVENT msg failed to deliver', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_MSG_READ', (chatId, msgId) => {
      this.logCoreEvent('DC_EVENT_MSG_DELIVERED', { chatId, msgId })
      render()
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

  logout () {
    this.close()
    this._resetState()

    log.info('Logged out')
    this.emit('logout')
    if (typeof this._render === 'function') this._render()
  }

  close () {
    if (!this._dc) return
    this._dc.close()
    this._dc = null
  }

  /**
   * TODO: Currently not used
   */
  getInfo () {
    if (this.ready === true) {
      return this._dc.getInfo()
    } else {
      return DeltaChat.getSystemInfo()
    }
  }

  sendMessage (chatId, text, filename, opts) {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this._dc.messageNew(viewType)
    if (filename) msg.setFile(filename)
    if (text) msg.setText(text)
    this._dc.sendMessage(chatId, msg)
  }

  /**
   * Update query for rendering chats with search input
   */
  searchChats (query) {
    this._query = query
    this._render()
  }

  deleteMessage (id) {
    log.info(`deleting message ${id}`)
    this._dc.deleteMessages(id)
  }

  initiateKeyTransfer (cb) {
    return this._dc.initiateKeyTransfer(cb)
  }

  continueKeyTransfer (...args) {
    return this._dc.continueKeyTransfer(...args)
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
    var chatId = this._dc.createChatByMessageId(deadDrop.id)
    if (chatId) this.selectChat(chatId)
  }

  unblockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, false)
    const name = contact.getNameAndAddress()
    log.info(`Unblocked contact ${name} (id = ${contactId})`)
    return true
  }

  blockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    log.debug(`Blocked contact ${name} (id = ${contactId})`)
    return true
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

  deleteChat (chatId) {
    log.debug(`action - deleting chat ${chatId}`)
    this._dc.deleteChat(chatId)
  }

  archiveChat (chatId, archive) {
    log.debug(`action - archiving chat ${chatId}`)
    this._dc.archiveChat(chatId, archive)
  }

  showArchivedChats (show) {
    this._showArchivedChats = show
    this._render()
  }

  createVerifiedGroup (name, image, contactIds) {
    const chatId = this._dc.createVerifiedGroupChat(name)
    return this._setGroupData(chatId, image, contactIds)
  }

  createUnverifiedGroup (name, image, contactIds) {
    const chatId = this._dc.createUnverifiedGroupChat(name)
    return this._setGroupData(chatId, image, contactIds)
  }

  _setGroupData (chatId, image, contactIds) {
    this._dc.setChatProfileImage(chatId, image)
    contactIds.forEach(id => this._dc.addContactToChat(chatId, id))
    this.selectChat(chatId)
    return { chatId }
  }

  leaveGroup (chatId) {
    log.debug(`action - leaving chat ${chatId}`)
    this._dc.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
  }

  selectChat (chatId) {
    log.debug(`action - selecting chat ${chatId}`)
    this._pages = 1
    this._selectedChatId = chatId
    this._render()
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

  backupImport (filename) {
    this._dc.importExport(C.DC_IMEX_IMPORT_BACKUP, filename)
  }

  backupExport (dir) {
    this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
  }

  setConfig (key, value) {
    log.info(`Setting config ${key}:${value}`)
    return this._dc.setConfig(key, String(value))
  }

  getConfig (key) {
    return this._dc.getConfig(key)
  }

  getConfigFor (keys) {
    let config = {}
    for (let key of keys) {
      config[key] = this.getConfig(key)
    }
    return config
  }

  getAdvancedSettings () {
    return {
      addr: this._dc.getConfig('addr'),
      mailUser: this._dc.getConfig('mail_user'),
      mailServer: this._dc.getConfig('mail_server'),
      mailPort: this._dc.getConfig('mail_port'),
      mailSecurity: this._dc.getConfig('mail_security'),
      sendUser: this._dc.getConfig('send_user'),
      sendPw: this._dc.getConfig('send_pw'),
      sendServer: this._dc.getConfig('send_server'),
      sendPort: this._dc.getConfig('send_port'),
      sendSecurity: this._dc.getConfig('send_security'),
      e2ee_enabled: this._dc.getConfig('e2ee_enabled')
    }
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

  _chatList (showArchivedChats) {
    if (!this._dc) return []

    const listFlags = showArchivedChats ? C.DC_GCL_ARCHIVED_ONLY : 0
    const list = this._dc.getChatList(listFlags, this._query)
    const listCount = list.getCount()

    const chatList = []
    for (let i = 0; i < listCount; i++) {
      const chatId = list.getChatId(i)
      const chat = this._dc.getChat(chatId).toJson()
      chat.color = this._integerToHexColor(chat.color)

      if (!chat) continue

      chat.summary = list.getSummary(i).toJson()
      chat.freshMessageCounter = this._dc.getFreshMessageCount(chatId)
      chat.isGroup = isGroupChat(chat)

      if (chat.id === C.DC_CHAT_ID_DEADDROP) {
        const messageId = list.getMessageId(i)
        chat.deaddrop = this._deadDropMessage(messageId)
      }

      chatList.push(chat)
    }
    return chatList
  }

  _deadDropMessage (id) {
    const msg = this._dc.getMessage(id)
    const fromId = msg && msg.getFromId()

    if (!fromId) {
      log.warn('Ignoring DEADDROP due to missing fromId')
      return
    }

    const contact = this._dc.getContact(fromId).toJson()
    return { id, contact }
  }

  _selectedChat (showArchivedChats, chatList, selectedChatId) {
    let selectedChat = chatList && chatList.find(({ id }) => id === selectedChatId)
    if (selectedChatId === C.DC_CHAT_ID_DEADDROP) {
      selectedChat = this._dc.getChat(selectedChatId)
      if (selectedChat) selectedChat = selectedChat.toJson()
    }
    if (!selectedChat) {
      this._selectedChatId = null
      return null
    }

    if (selectedChat.freshMessageCounter > 0) {
      this._dc.markNoticedChat(selectedChat.id)
      selectedChat.freshMessageCounter = 0
    }
    var messageIds = this._dc.getChatMessages(selectedChatId, C.DC_GCM_ADDDAYMARKER, 0)
    selectedChat.totalMessages = messageIds.length
    selectedChat.messages = this._messagesToRender(messageIds)

    if (this._saved.markRead) {
      this._dc.markSeenMessages(selectedChat.messages.map((msg) => msg.id))
    }

    selectedChat.contacts = this._dc.getChatContacts(selectedChatId).map(id => {
      return this._dc.getContact(id).toJson()
    })

    return selectedChat
  }

  _messagesToRender (messageIds) {
    const countMessages = messageIds.length
    const messageIdsToRender = messageIds.splice(
      Math.max(countMessages - (this._pages * PAGE_SIZE), 0),
      countMessages
    )

    if (messageIdsToRender.length === 0) return []

    let messages = Array(messageIdsToRender.length)

    for (let i = messageIdsToRender.length - 1; i >= 0; i--) {
      let id = messageIdsToRender[i]
      let json = this.messageIdToJson(id)

      if (id === C.DC_MSG_ID_DAYMARKER) {
        json.daymarker = {
          timestamp: messages[i + 1].msg.timestamp,
          id: 'd' + i
        }
      }
      messages[i] = json
    }

    return messages
  }

  messageIdToJson (id) {
    const msg = this._dc.getMessage(id)
    const filemime = msg && msg.getFilemime()
    const filename = msg && msg.getFilename()
    const filesize = msg && msg.getFilebytes()
    const fromId = msg && msg.getFromId()
    const isMe = fromId === C.DC_CONTACT_ID_SELF
    let contact = fromId ? this._dc.getContact(fromId).toJson() : {}
    if (contact.color) {
      contact.color = this._integerToHexColor(contact.color)
    }

    return {
      id,
      msg: msg.toJson(),
      filemime,
      filename,
      filesize,
      fromId,
      isMe,
      contact,
      isInfo: msg.isInfo()
    }
  }

  fetchMessages () {
    this._pages++
    this._render()
  }

  forwardMessage (msgId, contactId) {
    var chatId = this._dc.getChatIdByContactId(contactId)
    this._dc.forwardMessages(msgId, chatId)
    this.selectChat(chatId)
  }

  _blockedContacts (...args) {
    if (!this._dc) return []
    return this._dc.getBlockedContacts(...args).map(id => {
      return this._dc.getContact(id).toJson()
    })
  }

  getContacts (listFlags, queryStr) {
    var distinctIds = Array.from(new Set(this._dc.getContacts(listFlags, queryStr)))
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

  getChatMedia (msgType, orMsgType) {
    if (!this._selectedChatId) return
    var mediaMessages = this._dc.getChatMedia(this._selectedChatId, msgType, orMsgType)
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
    this._query = ''
  }
}

function addServerFlags (credentials) {
  return Object.assign({}, credentials, {
    serverFlags: serverFlags(credentials)
  })
}

function isGroupChat (chat) {
  return [
    C.DC_CHAT_TYPE_GROUP,
    C.DC_CHAT_TYPE_VERIFIED_GROUP
  ].includes(chat && chat.type)
}

function serverFlags ({ mailSecurity, sendSecurity }) {
  const flags = []

  if (mailSecurity === 'ssl') {
    flags.push(C.DC_LP_IMAP_SOCKET_SSL)
  } else if (mailSecurity === 'starttls') {
    flags.push(C.DC_LP_IMAP_SOCKET_STARTTLS)
  } else if (mailSecurity === 'plain') {
    flags.push(C.DC_LP_SMTP_SOCKET_PLAIN)
  }

  if (sendSecurity === 'ssl') {
    flags.push(C.DC_LP_SMTP_SOCKET_SSL)
  } else if (sendSecurity === 'starttls') {
    flags.push(C.DC_LP_SMTP_SOCKET_STARTTLS)
  } else if (sendSecurity === 'plain') {
    flags.push(C.DC_MAX_GET_INFO_LEN)
  }

  if (!flags.length) return null

  return flags.reduce((flag, acc) => {
    return acc | flag
  }, 0)
}

if (!module.parent) {
  // TODO move this to unit tests
  console.log(serverFlags({
    mailSecurity: 'ssl',
    sendSecurity: 'ssl'
  }))
  console.log(C.DC_LP_IMAP_SOCKET_SSL | C.DC_LP_SMTP_SOCKET_SSL)
  console.log(serverFlags({
    mailSecurity: 'starttls',
    sendSecurity: 'starttls'
  }))
  console.log(C.DC_LP_IMAP_SOCKET_STARTTLS | C.DC_LP_SMTP_SOCKET_STARTTLS)
}

module.exports = DeltaChatController
