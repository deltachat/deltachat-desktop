const DeltaChat = require('deltachat-node')
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
    isMe: fromId === 1,
    contact: contact ? contact.toJson() : {},
    msg: msg && msg.toJson(),
    filemime: msg && msg.getFilemime()
  }
}

function chatIdToJson (chatId, dc) {
  const chat = dc.getChat(chatId).toJson()
  const messageIds = dc.getChatMessages(chatId, 0, 0)
  chat.messages = messageIds.map(id => messageIdToJson(id, dc))
  if (chatId === 1) {
    // dead drop
    const msg = dc.getMessage(messageIds[0])
    const fromId = msg.getFromId()
    if (fromId) {
      const contact = dc.getContact(fromId)
      if (contact) {
        chat.contact = contact.toJson()
      }
    }
  }
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
    this.ready = false
    this.credentials = {
      email: null,
      cwd: null
    }
  }

  /**
   * Dispatched when logging in from Login
   */
  login (credentials, render) {
    // Creates a separate DB file for each login
    const cwd = path.join(this.cwd, Buffer.from(credentials.email).toString('hex'))
    log('Using deltachat instance', cwd)
    this._dc = new DeltaChat()
    var dc = this._dc
    this.credentials.email = credentials.email
    this.credentials.cwd = cwd
    this._render = render

    dc.open(cwd, err => {
      if (err) throw err
      const onReady = () => {
        log('Ready')
        this.ready = true
        this.configuring = false
        const addr = credentials.email
        if (!electron.app.logins.includes(addr)) {
          electron.app.logins.push(addr)
        }
        render()
      }
      if (!dc.isConfigured()) {
        dc.once('ready', onReady)
        this.configuring = true
        dc.configure({
          addr: credentials.email,
          mail_pw: credentials.password
        })
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

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      log('event msgs changed', chatId, msgId)
      if (dc.getMessage(msgId)) render()
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      log('incoming message', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId, msgId) => {
      log('message delivered', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId, msgId) => {
      log('message failed to deliver', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_MSG_READ', (chatId, msgId) => {
      log('message read', chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_WARNING', (warning) => {
      this._warning(warning)
    })

    dc.on('DC_EVENT_ERROR', (code, error) => {
      this._error(`${error} (code = ${code})`)
    })
  }

  /**
   * Dispatched when logging out from ChatList
   */
  logout () {
    this._dc.close()
    this._dc = null
    this.configuring = false
    this.ready = false
    log('Logged out')
    if (typeof this._render === 'function') this._render()
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
  chatWithContact (contactId) {
    log('chat with contact', contactId)
    if (this._dc.getContacts().indexOf(contactId) === -1) {
      const contact = this._dc.getContact(contactId)
      const address = contact.getAddress()
      const name = contact.getName() || address.split('@')[0]
      this._dc.createContact(name, address)
      log(`Added contact ${name} (${address})`)
      this.createChatByContactId(contactId)
    }
  }

  /**
   * Dispatched when denying a chat in DeadDrop
   */
  blockContact (contactId) {
    log('block contact', contactId)
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    this._warning(`Blocked contact ${name} (id = ${contactId})`)
  }

  /**
   * Dispatched when creating a chat in CreateChat
   */
  createChatByContactId (contactId) {
    const contact = this._dc.getContact(contactId)
    if (!contact) return 0
    return this._dc.createChatByContactId(contactId)
  }

  /**
   * TODO: Not yet dispatched from any view
   */
  deleteChat (chatId) {
    this._dc.deleteChat(chatId)
  }

  /**
   * TODO: Not yet dispatched from any view
   */
  archiveChat (chatId) {
    this._dc.archiveChat(chatId, true)
  }

  /**
   * Dispatched when creating an unverified group in CreateGroup
   */
  createUnverifiedGroup (contacts, name) {
    var chatId = this._dc.createUnverifiedGroupChat(name)
    var results = contacts.map((c) => {
      this._dc.addContactToChat(chatId, c.id)
    })
    return { chatId, results }
  }

  /**
   * Returns the state in json format
   */
  render () {
    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready,
      chats: this._chats(),
      contacts: this._contacts()
    }
  }

  /**
   * Internal
   * Returns chats in json format
   */
  _chats () {
    if (!this._dc) return []
    const chats = []
    const list = this._dc.getChatList()
    const count = list.getCount()
    for (let i = 0; i < count; i++) {
      const chatId = list.getChatId(i)
      const chat = chatIdToJson(chatId, this._dc)
      chat.summary = list.getSummary(i).toJson()
      chats.push(chat)
    }

    return chats.sort((a, b) => {
      return a.summary.timestamp < b.summary.timestamp
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
   * Logging methods
   */
  _warning (line) { log('WARNING', line) }
  _error (line) { log.error(line) }
}

module.exports = DeltaChatController
