const DeltaChat = require('deltachat-node')
const path = require('path')

const log = require('./log')
const config = require('../config')

class ChatMessage {
  constructor (messageId, dc) {
    var msg = dc.getMessage(messageId)
    this.fromId = msg && msg.getFromId()
    if (!this.fromId) return

    this.msg = msg
    this.messageId = messageId
    this.isMe = this.fromId === 1
    this.contact = dc.getContact(this.fromId)
  }

  toJson () {
    return {
      fromId: this.fromId,
      id: this.messageId,
      isMe: this.isMe,
      contact: this.contact.toJson(),
      msg: this.msg.toJson(),
      filemime: this.msg.getFilemime()
    }
  }
}

class ChatPage {
  constructor (chatId, dc) {
    this._messages = []
    this._dc = dc
    this.chatId = chatId
    this.chat = this._dc.getChat(this.chatId)
  }

  messages () {
    return this._messages
  }

  append (line) {
    this._messages.push(line)
  }

  clear () {
    this._messages = []
  }

  toJson () {
    var chat = this.chat.toJson()
    chat.messages = this._messages.map((m) => m.toJson())
    chat.summary = this.summary && this.summary.toJson()
    chat.fromId = this.fromId
    return chat
  }

  appendMessage (messageId) {
    this.append(new ChatMessage(messageId, this._dc))
  }

  deleteMessage (messageId) {
    const index = this._messages.findIndex(m => {
      return m.messageId === messageId
    })
    if (index !== -1) {
      this._messages.splice(index, 1)
    }
  }
}

class DeltaChatController {
  // The Controller is the container for a deltachat instance
  constructor () {
    this._chats = []
    this.ready = false
    this.credentials = {
      email: null,
      cwd: null
    }
  }

  init (credentials, render) {
    // Creates a separate DB file for each login
    var self = this
    const cwd = path.join(config.CONFIG_PATH, Buffer.from(credentials.email).toString('hex'))
    log('Using deltachat instance', cwd)
    this._dc = new DeltaChat()
    var dc = this._dc
    this.credentials.email = credentials.email
    this.credentials.cwd = cwd

    dc.open(cwd, err => {
      if (err) throw err
      const onReady = () => {
        log('Ready')
        self.ready = true
        self.configuring = false
        self.loadChats()
        render()
      }
      if (!dc.isConfigured()) {
        dc.once('ready', onReady)
        self.configuring = true
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
          self.dc = null
          self.configuring = false
          self.ready = false
          render()
        }
      }
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      log('event msgs changed', chatId, msgId)
      const msg = dc.getMessage(msgId)
      if (!msg) return

      if (msg.getState().isPending()) {
        this.appendMessage(chatId, msgId)
      }
      render()
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      log('incoming message', chatId, msgId)
      self.appendMessage(chatId, msgId)
      render()
    })

    dc.on('DC_EVENT_WARNING', function (warning) {
      self.warning(warning)
    })

    dc.on('DC_EVENT_ERROR', (code, error) => {
      self.error(`${error} (code = ${code})`)
    })
  }

  getStarredMessages () {
    return this._dc.getStarredMessages().map(messageId => {
      return new ChatMessage(messageId, this._dc)
    })
  }

  loadChats (_chatId) {
    var list = this._dc.getChatList()
    this._chatList = list
    var count = list.getCount()
    for (let i = 0; i < count; i++) {
      var chatId = list.getChatId(i)
      this._loadChatPage(chatId, {
        summary: list.getSummary(i),
        loadMessages: _chatId === chatId
      })
    }
  }

  clearChatPage (chatId) {
    var chat = this._loadChatPage(chatId)
    chat.clear()
  }

  loadMessages (chatId) {
    const chat = this._loadChatPage(chatId)
    const messageIds = this._dc.getChatMessages(chatId, 0, 0)
    messageIds.forEach(chat.appendMessage.bind(chat))
  }

  sendMessage (...args) {
    return this._dc.sendTextMessage(...args)
  }

  createChat (...args) {
    return this._dc.createChat(...args)
  }

  initiateKeyTransfer (...args) {
    return this._dc.initiateKeyTransfer(...args)
  }

  continueKeyTransfer (...args) {
    return this._dc.continueKeyTransfer(...args)
  }

  createContact (...args) {
    return this._dc.createContact(...args)
  }

  chatWithContact (contactId) {
    log('chat with contact', contactId)
    const contact = this._dc.getContact(contactId)
    if (this._dc.getContacts().indexOf(contactId) === -1) {
      const address = contact.getAddress()
      const name = contact.getName() || address.split('@')[0]
      this._dc.createContact(name, address)
      this.info(`Added contact ${name} (${address})`)
    }
    this.loadChats()
  }

  blockContact (contactId) {
    log('block contact', contactId)
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    this.warning(`Blocked contact ${name} (id = ${contactId})`)
  }

  appendMessage (chatId, messageId) {
    this._loadChatPage(chatId).appendMessage(messageId)
  }

  _loadChatPage (chatId, opts) {
    if (!opts) opts = {}
    let page = this._chats[chatId]
    if (!page) {
      page = new ChatPage(chatId, this._dc)
      this._chats[chatId] = page
    }
    if (chatId === 1) {
      // dead drop
      const messageIds = this._dc.getChatMessages(chatId, 0, 0)
      const msg = this._dc.getMessage(messageIds[0])
      page.fromId = msg.getFromId()
    }
    if (opts.summary) page.summary = opts.summary
    if (opts.loadMessages) this.loadMessages(chatId)
    return page
  }

  chats () {
    var chats = this._chats
    return Object.keys(chats).map((id) => chats[id].toJson()).sort(function (a, b) {
      return a.summary.timestamp < b.summary.timestamp
    })
  }

  deleteMessage (chatId, messageId) {
    this._dc.deleteMessages(messageId)
    this._loadChatPage(chatId).deleteMessage(messageId)
  }

  createChatByContactId (contactId) {
    const contact = this._dc.getContact(contactId)
    if (!contact) return 0
    const chatId = this._dc.createChatByContactId(contactId)
    this.loadChats()
    return chatId
  }

  deleteChat (chatId) {
    const index = this._chats.findIndex(page => {
      return page.chatId === chatId
    })
    if (index !== -1) {
      this._dc.deleteChat(chatId)
      this._chats.splice(index, 1)
    }
  }

  archiveChat (chatId) {
    const index = this._chats.findIndex(page => {
      return page.chatId === chatId
    })
    if (index !== -1) {
      this._dc.archiveChat(chatId, true)
      this._chats.splice(index, 1)
    }
  }

  info (line) {
    log(line)
  }

  result (line) {
    log(line)
  }

  warning (line) {
    log.error(line)
  }

  error (line) {
    log.error(line)
  }

  _getChats () {
    return this._dc.getChats()
  }

  contacts (...args) {
    if (!this._dc) return []
    else return this._dc.getContacts(...args).map((id) => this._dc.getContact(id).toJson())
  }

  createUnverifiedGroup (contacts, name) {
    var chatId = this._dc.createUnverifiedGroupChat(name)
    var results = contacts.map((c) => {
      this._dc.addContactToChat(chatId, c.id)
    })
    return { chatId, results }
  }

  render () {
    return {
      configuring: this.configuring,
      credentials: this.credentials,
      ready: this.ready,
      chats: this.chats(),
      contacts: this.contacts()
    }
  }
}

module.exports = DeltaChatController
