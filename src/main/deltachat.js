const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const electron = require('electron')
const events = require('events')
const path = require('path')
const log = require('./log')

const PAGE_SIZE = 20

/**
 * The Controller is the container for a deltachat instance
 */
class DeltaChatController extends events.EventEmitter {
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

  /**
   * Dispatched when logging in from Login
   */
  login (credentials, render, coreStrings) {
    // Creates a separate DB file for each login
    const cwd = path.join(this.cwd, Buffer.from(credentials.addr).toString('hex'))
    log('Using deltachat instance', cwd)
    this._dc = new DeltaChat()
    var dc = this._dc
    this.credentials = credentials
    this._render = render

    this.setCoreStrings(coreStrings)

    dc.open(cwd, err => {
      if (err) throw err
      const onReady = () => {
        log('Ready')
        this.ready = true
        this.configuring = false
        if (!electron.app.logins.includes(credentials.addr)) {
          electron.app.logins.push(credentials.addr)
        }
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
      log(event, data1, data2)
      if (event === 2041) {
        log('DC_EVENT_CONFIGURE_PROGRESS', data1)
        if (Number(data1) === 0) { // login failed
          this.logout()
        }
      }
    })

    dc.on('DC_EVENT_IMEX_FILE_WRITTEN', (filename) => {
      this.emit('DC_EVENT_IMEX_FILE_WRITTEN', filename)
    })

    dc.on('DC_EVENT_IMEX_PROGRESS', (progress) => {
      this.emit('DC_EVENT_IMEX_PROGRESS', progress)
    })

    dc.on('DC_EVENT_CONTACTS_CHANGED', (contactId) => {
      log('EVENT contacts changed', contactId)
      render()
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      log('EVENT msgs changed', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      this.emit('DC_EVENT_INCOMING_MSG', chatId, msgId)
      log('EVENT incoming msg', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId, msgId) => {
      log('EVENT msg delivered', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId, msgId) => {
      log('EVENT msg failed to deliver', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_MSG_READ', (chatId, msgId) => {
      log('EVENT msg read', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_WARNING', (warning) => {
      log.warning(warning)
    })

    dc.on('DC_EVENT_ERROR', (error) => {
      this.emit('DC_EVENT_ERROR', error)
      log.error(error)
    })

    dc.on('DC_EVENT_NETWORK_ERROR', (error) => {
      this.emit('DC_EVENT_NETWORK_ERROR', error)
      log.error(error)
    })
  }

  /**
   * Dispatched when logging out from ChatList
   */
  logout () {
    this._dc.close()
    this._dc = null

    this._resetState()

    log('Logged out')
    if (typeof this._render === 'function') this._render()
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

  /**
   * Dispatched when sending a message in ChatView
   */
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

  /**
   * Dispatched from RenderMessage#onDelete in ChatView
   */
  deleteMessage (messageId) {
    log('deleting message', messageId)
    this._dc.deleteMessages(messageId)
  }

  /**
   * Dispatched in KeyTransfer dialog
   */
  initiateKeyTransfer (...args) {
    return this._dc.initiateKeyTransfer(...args)
  }

  /**
   * Dispatched in SetupMessage dialog
   */
  continueKeyTransfer (...args) {
    return this._dc.continueKeyTransfer(...args)
  }

  /**
   * Dispatched when creating contact in CreateContact
   */
  createContact (...args) {
    return this._dc.createContact(...args)
  }

  /**
   * Dispatched when accepting a chat in DeadDrop
   */
  chatWithContact (deadDrop) {
    log('chat with dead drop', deadDrop)
    const contact = this._dc.getContact(deadDrop.contact.id)
    const address = contact.getAddress()
    const name = contact.getName() || address.split('@')[0]
    this._dc.createContact(name, address)
    log(`Added contact ${name} (${address})`)
    var chatId = this._dc.createChatByMessageId(deadDrop.id)
    if (chatId) this.selectChat(chatId)
  }

  /**
   * Dispatched from UnblockContacts
   */
  unblockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, false)
    const name = contact.getNameAndAddress()
    log(`Unblocked contact ${name} (id = ${contactId})`)
    return true
  }

  /**
   * Dispatched when denying a chat in DeadDrop
   */
  blockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    log(`Blocked contact ${name} (id = ${contactId})`)
    return true
  }

  /**
   * Dispatched when creating a chat in CreateChat
   */
  createChatByContactId (contactId) {
    const contact = this._dc.getContact(contactId)
    if (!contact) {
      log.warning('no contact could be found with id', contactId)
      return 0
    }
    const chatId = this._dc.createChatByContactId(contactId)
    log('created chat', chatId, 'with contact', contactId)
    const chat = this._dc.getChat(chatId)
    if (chat && chat.getArchived()) {
      log('chat was archived, unarchiving it')
      this._dc.archiveChat(chatId, 0)
    }
    this.selectChat(chatId)
    return chatId
  }

  /**
   * Dispatched when from EditGroup
   */
  getChatContacts (chatId) {
    return this._dc.getChatContacts(chatId)
  }

  /**
   * Dispatched from EditGroup
   */
  modifyGroup (chatId, name, image, remove, add) {
    log('modify group', chatId, name, image, remove, add)
    this._dc.setChatName(chatId, name)
    const chat = this._dc.getChat(chatId)
    if (chat.getProfileImage() !== image) {
      this._dc.setChatProfileImage(chatId, image || '')
    }
    remove.forEach(id => this._dc.removeContactFromChat(chatId, id))
    add.forEach(id => this._dc.addContactToChat(chatId, id))
    return true
  }

  /**
   * Dispatched from menu alternative in SplittedChatListAndView
   */
  deleteChat (chatId) {
    log('deleting chat', chatId)
    this._dc.deleteChat(chatId)
  }

  /**
   * Dispatched from menu alternative in SplittedChatListAndView
   */
  archiveChat (chatId, archive) {
    log('archiving chat', chatId)
    this._dc.archiveChat(chatId, archive)
  }

  /**
   * Dispatched from SplittedChatListAndView
   */
  showArchivedChats (show) {
    this._showArchivedChats = show
    this._render()
  }

  /**
   * Dispatched when creating a verified group in CreateGroup
   */
  createVerifiedGroup (name, image, contactIds) {
    const chatId = this._dc.createVerifiedGroupChat(name)
    return this._setGroupData(chatId, image, contactIds)
  }

  /**
   * Dispatched when creating an unverified group in CreateGroup
   */
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

  /**
   * Dispatched from menu alternative in SplittedChatListAndView
   */
  leaveGroup (chatId) {
    log('leaving chat')
    this._dc.removeContactFromChat(chatId, C.DC_CONTACT_ID_SELF)
  }

  /**
   * Dispatched from SplittedChatListAndView and used internally
   */
  selectChat (chatId) {
    log('selecting chat with id', chatId)
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

  /**
   * Dispatched from GroupBase when showing a QR code for:
   * - "Joining a verified group" protocol
   * - "Setup verified contact" protocol (chatId = 0)
   */
  getQrCode (chatId = 0) {
    return this._dc.getSecurejoinQrCode(chatId)
  }

  backupImport (filename) {
    this._dc.importExport(C.DC_IMEX_IMPORT_BACKUP, filename)
  }

  backupExport (directory) {
    this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, directory)
  }

  getAdvancedSettings () {
    return {
      addr: this._dc.getConfig('addr'),
      mailUser: this._dc.getConfig('mail_user'),
      mailPw: this._dc.getConfig('mail_pw'),
      mailServer: this._dc.getConfig('mail_server'),
      mailPort: this._dc.getConfig('mail_port'),
      mailSecurity: this._dc.getConfig('mail_security'),
      sendUser: this._dc.getConfig('send_user'),
      sendPw: this._dc.getConfig('send_pw'),
      sendServer: this._dc.getConfig('send_server'),
      sendPort: this._dc.getConfig('send_port'),
      sendSecurity: this._dc.getConfig('send_security')
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
      log.warning('Ignoring DEADDROP due to missing fromId')
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
    if (this._saved.markRead) {
      this._dc.markSeenMessages(selectedChat.messageIds)
    }

    var messageIds = this._dc.getChatMessages(selectedChatId, C.DC_GCM_ADDDAYMARKER, 0)
    selectedChat.totalMessages = messageIds.length
    selectedChat.messages = this._messagesToRender(messageIds)
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
