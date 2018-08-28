const CONSTANTS = require('deltachat-node/constants')
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
      messageId: this.messageId,
      isMe: this.isMe,
      contact: this.contact.toJson(),
      msg: this.msg.toJson()
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
    chat.summary = this.summary.toJson()
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
    this._dc = null
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
    var dc = this._dc = new DeltaChat({
      addr: credentials.email,
      mail_pw: credentials.password,
      cwd
    })
    this.credentials.email = credentials.email
    this.credentials.cwd = cwd

    dc.open(err => {
      if (err) throw err
      log('Ready')
      self.ready = true
      self.loadChats()
      render()
    })

    dc.on('ALL', (event, data1, data2) => {
      log(event, data1, data2)
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      log('event msgs changed', chatId, msgId)
      const msg = dc.getMessage(msgId)
      if (!msg) return

      if (msg.getState().isPending()) {
        this.appendMessage(chatId, msgId)
      } else if (msg.isDeadDrop()) {
        this.queueDeadDropMessage(msg)
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

  loadChats () {
    var list = this._dc.getChatList()
    this._chatList = list
    var count = list.getCount()
    log('got', count, 'chats')
    for (let i = 0; i < count; i++) {
      this._loadChatPage(list.getChatId(i))
    }
  }

  clearChatPage (chatId) {
    var chat = this._loadChatPage(chatId)
    chat.clear()
  }

  getChatSummary (chatId) {
    log('getting chat summary', chatId)
    const index = this._chats.findIndex(page => {
      return page.chatId === chatId
    })
    if (index < 0) return this.error(`summary for ${index} does not exist`)
    return this._chatList.getSummary(index)
  }

  loadMessages (chatId) {
    const chat = this._loadChatPage(chatId)
    const messageIds = this._dc.getChatMessages(chatId, 0, 0)
    messageIds.forEach(id => chat.appendMessage(id))
  }

  sendMessage (...args) {
    return this._dc.sendTextMessage(...args)
  }

  createChat (...args) {
    return this._dc.createChat(...args)
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
    const chatId = this.createChatByContactId(contactId)
    this._loadChat(chatId)
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

  _loadChatPage (chatId) {
    let page = this._chats.find(p => p.chatId === chatId)
    if (!page) {
      page = new ChatPage(chatId, this._dc)
      this._chats.push(page)
    }
    page.summary = this.getChatSummary(chatId)
    return page
  }

  chats () {
    return this._chats.map((c) => c.toJson())
  }

  deleteMessage (chatId, messageId) {
    this._dc.deleteMessages(messageId)
    this._loadChatPage(chatId).deleteMessage(messageId)
  }

  createChatByContactId (contactId) {
    const contact = this._dc.getContact(contactId)
    if (!contact) return 0
    const chatId = this._dc.createChatByContactId(contactId)
    this._loadChatPage(chatId)
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
    return {chatId, results}
  }

  render () {
    return {
      credentials: this.credentials,
      ready: this.ready,
      chats: this.chats(),
      contacts: this.contacts()
    }
  }
}

module.exports = DeltaChatController
