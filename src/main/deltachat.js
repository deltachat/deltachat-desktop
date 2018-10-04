const DeltaChat = require('deltachat-node')
const path = require('path')

const log = require('./log')
const config = require('../config')

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

class ChatPage {
  constructor (chatId, dc) {
    this._dc = dc
    this.chatId = chatId
    this.chat = this._dc.getChat(this.chatId)
  }

  toJson () {
    var chat = this.chat.toJson()
    const messageIds = this._dc.getChatMessages(this.chatId, 0, 0)
    chat.messages = messageIds.map(id => messageIdToJson(id, this._dc))
    chat.summary = this.summary && this.summary.toJson()
    if (this.fromId) {
      var contact = this._dc.getContact(this.fromId)
      if (contact) chat.contact = contact.toJson()
    }
    return chat
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

  logout () {
    this.dc = null
    this.configuring = false
    this.ready = false
    if (typeof this._render === 'function') this._render()
  }

  init (credentials, render) {
    // Creates a separate DB file for each login
    const cwd = path.join(config.CONFIG_PATH, Buffer.from(credentials.email).toString('hex'))
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
        this.loadChats()
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
      this.warning(warning)
    })

    dc.on('DC_EVENT_ERROR', (code, error) => {
      this.error(`${error} (code = ${code})`)
    })
  }

  loadChats (_chatId) {
    var list = this._dc.getChatList()
    this._chatList = list
    var count = list.getCount()
    for (let i = 0; i < count; i++) {
      var chatId = list.getChatId(i)
      this._loadChatPage(chatId, {
        summary: list.getSummary(i)
      })
    }
  }

  getSummaryByChatId (chatId) {
    var index = this.getChatIndex(chatId)
    return this._chatList.getSummary(index)
  }

  getChatIndex (_chatId) {
    var list = this._dc.getChatList()
    this._chatList = list
    var count = list.getCount()
    for (let i = 0; i < count; i++) {
      var chatId = list.getChatId(i)
      if (chatId === _chatId) return i
    }
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
    if (this._dc.getContacts().indexOf(contactId) === -1) {
      const contact = this._dc.getContact(contactId)
      const address = contact.getAddress()
      const name = contact.getName() || address.split('@')[0]
      this._dc.createContact(name, address)
      this.info(`Added contact ${name} (${address})`)
      this.createChatByContactId(contactId)
      this.loadChats()
    }
  }

  blockContact (contactId) {
    log('block contact', contactId)
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    this.warning(`Blocked contact ${name} (id = ${contactId})`)
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
    page.summary = opts.summary || this.getSummaryByChatId(chatId)
    return page
  }

  chats () {
    var chats = this._chats
    return Object.keys(chats).map((id) => chats[id].toJson()).sort(function (a, b) {
      return a.summary.timestamp < b.summary.timestamp
    })
  }

  deleteMessage (chatId, messageId) {
    // TODO dispatch this call from view and re-render (if we get
    // an event for this, we can re-render there)
    this._dc.deleteMessages(messageId)
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
    log('WARNING', line)
  }

  error (line) {
    log.error(line)
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
