const CONSTANTS = require('deltachat-node/constants')
const DeltaChat = require('deltachat-node')
const path = require('path')

const log = require('./log')
const config = require('../config')

const MAX_PAGE_LENGTH = 20000

function ChatMessage (messageId, dc) {
  var msg = dc.getMessage(messageId)
  if (!msg) return {messageId}
  var fromId = msg.getFromId()
  return {
    messageId,
    msg,
    fromId,
    isMe: fromId === 1,
    contact: dc.getContact(fromId)
  }
}

class AbstractPage {
  constructor (name, config) {
    this._name = name
    this._lines = []
    this._allLines = []
    this._scrollback = 0
    this._config = config
  }

  lines () {
    return this._lines
  }

  name () {
    return this._name
  }

  append (line) {
    this._lines.push(line)
    if (this._lines.length > MAX_PAGE_LENGTH) {
      this._lines.shift()
    }
  }

  clear () {
    this._lines = []
  }
}

class StatusPage extends AbstractPage {
  constructor () {
    super('status')
  }
}

class ChatPage extends AbstractPage {
  constructor (chatId, dc) {
    super('')
    this.chatId = chatId
    this._dc = dc
  }

  name () {
    return `#${this._dc.getChat(this.chatId).getName()}`
  }

  appendMessage (messageId) {
    this.append(ChatMessage(messageId, this._dc))
  }

  deleteMessage (messageId) {
    const index = this._lines.findIndex(line => {
      return line.messageId === messageId
    })
    if (index !== -1) {
      this._lines.splice(index, 1)
    }
  }
}

class DeltaChatController {
  // The Controller is the container for a deltachat instance
  constructor () {
    this._chats = []
    this._statusPage = new StatusPage()
    this._dc = null
    this.ready = false
    this.credentials = {
      email: null,
      cwd: null
    }
  }

  init (credentials, cb) {
    var self = this

    // Creates a separate DB file for each login
    const cwd = path.join(config.CONFIG_PATH, Buffer.from(credentials.email).toString('hex'))
    log('Using deltachat instance', cwd)
    var dc = this._dc = new DeltaChat({
      addr: credentials.email,
      mail_pw: credentials.password,
      cwd
    })
    self.credentials.email = credentials.email
    self.credentials.cwd = cwd

    dc.open(function (err) {
      if (err) return log.error(err)
      log('Ready')
      self.ready = true
      self.loadChats()
      if (cb) cb()
    })

    dc.on('ALL', (event, data1, data2) => {
      log(event, data1, data2)
    })

    dc.on('DC_EVENT_MSGS_CHANGES', (chatId, msgId) => {
      const msg = dc.getMessage(msgId)
      if (msg === null) return

      if (msg.getState().isPending()) {
        self.appendMessage(chatId, msgId)
      } else if (msg.isDeadDrop()) {
        self.queueDeadDropMessage(msg)
      }
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      self.appendMessage(chatId, msgId)
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
      return ChatMessage(messageId, this._dc)
    })
  }

  loadChats () {
    var chats = this._getChats()
    log('got chats', chats)
    chats.forEach(id => this._loadChat(id))
  }

  _loadChat (chatId) {
    log('loading chat', chatId)
    const chat = this._getChatPage(chatId)
    const messageIds = this._dc.getChatMessages(chatId, 0, 0)
    messageIds.forEach(id => chat.appendMessage(id))
  }

  dispatch (name, ...args) {
    var handler = this._dc[name]
    if (!handler) throw new Error(`fn with name ${name} does not exist`)
    console.log('dispatch', handler, args)
    return handler.bind(this._dc)(...args)
  }

  chatWithContact (contactId) {
    const contact = this._dc.getContact(contactId)
    if (this._dc.getContacts().indexOf(contactId) === -1) {
      const address = contact.getAddress()
      const name = contact.getName() || address.split('@')[0]
      this._dc.createContact(name, address)
      this.info(`Added contact ${name} (${address})`)
    }
    const chatId = this.createChatByContactId(contactId)
    this._loadChat(chatId)
    this._selectChatPage(chatId)
  }

  blockContact (contactId) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    this.warning(`Blocked contact ${name} (id = ${contactId})`)
  }

  appendMessage (chatId, messageId) {
    this._getChatPage(chatId).appendMessage(messageId)
  }

  _getChatPage (chatId) {
    console.log('get chat page', chatId)
    let page = this._chats.find(p => p.chatId === chatId)
    if (!page) {
      page = new ChatPage(chatId, this._dc)
      this._chats.push(page)
    }
    return page
  }

  chats () {
    return this._chats
  }

  statuses () {
    return this._statusPage.lines()
  }

  deleteMessage (chatId, messageId) {
    this._dc.deleteMessages(messageId)
    this._getChatPage(chatId).deleteMessage(messageId)
  }

  createChatByContactId (contactId) {
    const chatId = this._dc.createChatByContactId(contactId)
    this._getChatPage(chatId)
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

  unArchiveChat (chatId) {
    const currChatId = this.currentPage().chatId
    this._dc.archiveChat(chatId, false)
    this._loadChat(chatId)
    if (typeof currChatId === 'number') {
      this._selectChatPage(currChatId)
    }
  }

  onEnter (line) {
    const page = this.currentPage()
    if (typeof page.chatId === 'number') {
      // TODO this seems to take some time, measure this and log
      // to debug window
      this._dc.sendTextMessage(page.chatId, line)
    }
  }

  info (line) {
    this._statusPage.append(line)
    log(line)
  }

  result (line) {
    this._statusPage.append(line)
    log(line)
  }

  warning (line) {
    this._statusPage.append(line)
    log.error(line)
  }

  error (line) {
    this._statusPage.append(line)
    log.error(line)
  }

  _getChats () {
    return this._dc.getChats(CONSTANTS.DC_CHAT_ID_DEADDROP)
  }

  contacts (...args) {
    if (!this._dc) return []
    else return this._dc.getContacts(...args)
  }

  render () {
    return {
      credentials: this.credentials,
      ready: this.ready,
      chats: this.chats(),
      statuses: this.statuses(),
      contacts: this.contacts()
    }
  }
}

module.exports = DeltaChatController
