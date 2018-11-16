const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const electron = require('electron')
const path = require('path')
const log = require('./log')

function messageIdToJson (messageId, dc) {
  const msg = dc.getMessage(messageId)
  const fromId = msg && msg.getFromId()
  const contact = fromId && dc.getContact(fromId)
  return {
    fromId,
    id: messageId,
    isMe: fromId === C.DC_CONTACT_ID_SELF,
    contact: contact ? contact.toJson() : {},
    msg: msg && msg.toJson(),
    filemime: msg && msg.getFilemime()
  }
}

function chatIdToJson (chatId, dc) {
  const chat = dc.getChat(chatId).toJson()
  const messageIds = dc.getChatMessages(chatId, 0, 0)
  chat.messages = messageIds.map(id => messageIdToJson(id, dc))
  chat.contacts = dc.getChatContacts(chatId).map(id => {
    return dc.getContact(id).toJson()
  })
  if (chatId === C.DC_CHAT_ID_DEADDROP) {
    const msg = dc.getMessage(messageIds[0])
    const fromId = msg && msg.getFromId()

    if (!fromId) {
      log.warning('Ignoring DEADDROP due to missing fromId')
      return null
    }

    const contact = dc.getContact(fromId)
    if (contact) {
      chat.contact = contact.toJson()
    }
  }
  chat.freshMessageCounter = dc.getFreshMessageCount(chatId)
  return chat
}

/**
 * The Controller is the container for a deltachat instance
 */
class DeltaChatController {
  /**
   * Created and owned by ipc on the backend
   */
  constructor (cwd) {
    this.cwd = cwd
    this._resetState()
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
        dc.configure(credentials)
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

    dc.on('DC_EVENT_CONTACTS_CHANGED', (contactId) => {
      log('EVENT contacts changed', contactId)
      render()
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      log('EVENT msgs changed', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
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

    dc.on('DC_EVENT_ERROR', (code, err) => {
      log.error(`${err} (code = ${code})`)
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
  sendMessage (chatId, text) {
    const msg = this._dc.messageNew()
    msg.setText(text)
    this._dc.sendMessage(chatId, msg)
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
  chatWithContact (deadDropChat) {
    log('chat with dead drop', deadDropChat)
    const contact = this._dc.getContact(deadDropChat.contact.id)
    const address = contact.getAddress()
    const name = contact.getName() || address.split('@')[0]
    this._dc.createContact(name, address)
    log(`Added contact ${name} (${address})`)
    var message = deadDropChat.messages[0]
    if (!message) log.warning('no message for deaddropchat?')
    else this._dc.createChatByMessageId(message.id)
  }

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
  modifyGroup (chatId, name, remove, add) {
    log('setting chat', chatId, 'name to', name)
    this._dc.setChatName(chatId, name)
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
   * Dispatched when creating an unverified group in CreateGroup
   */
  createUnverifiedGroup (name, contactIds) {
    const chatId = this._dc.createUnverifiedGroupChat(name)
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
   * Returns the state in json format
   */
  render () {
    let showArchivedChats = this._showArchivedChats
    let chats = this._chats()
    let archivedChats = this._archivedChats()

    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready,
      contacts: this._contacts(),
      blockedContacts: this._blockedContacts(),
      showArchivedChats,
      selectedChat: this._selectedChat(showArchivedChats ? archivedChats : chats),
      chats,
      archivedChats
    }
  }

  /**
   * Internal
   * Returns chats in json format
   */
  _chats (listFlags = 0) {
    if (!this._dc) return []
    const chats = []
    const list = this._dc.getChatList(listFlags)
    const count = list.getCount()
    for (let i = 0; i < count; i++) {
      const chatId = list.getChatId(i)
      const chat = chatIdToJson(chatId, this._dc)
      if (chat) {
        chat.summary = list.getSummary(i).toJson()
        chats.push(chat)
      }
    }
    return chats
  }

  _archivedChats () {
    return this._chats(C.DC_GCL_ARCHIVED_ONLY)
  }

  _selectedChat (chats) {
    if (!chats) return null
    let selectedChat = chats.find(({ id }) => id === this._selectedChatId)

    if (!selectedChat) {
      this._selectedChatId = null
      return null
    }
    this._selectedChatId = selectedChat.id
    if (selectedChat.freshMessageCounter > 0) {
      this._dc.markNoticedChat(selectedChat.id)
      selectedChat.freshMessageCounter = 0
    }
    return selectedChat
  }

  _blockedContacts (...args) {
    if (!this._dc) return []
    return this._dc.getBlockedContacts(...args).map(id => {
      return this._dc.getContact(id).toJson()
    })
  }

  /**
   * Internal
   * Returns contacts in json format
   */
  _contacts (...args) {
    if (!this._dc) return []
    return this._dc.getContacts(...args).map(id => {
      return this._dc.getContact(id).toJson()
    })
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
  }
}

module.exports = DeltaChatController
