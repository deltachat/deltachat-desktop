const CONSTANTS = require('deltachat-node/constants')
const DeltaChat = require('deltachat-node')
const path = require('path')

const log = require('./log')
const config = require('../config')

const MAX_PAGE_LENGTH = 20000

class ChatMessage {
  constructor (messageId, dc) {
    this.messageId = messageId
    this._dc = dc
  }

  repr () {
    const msg = this._dc.getMessage(this.messageId)
    if (msg === null) return ''

    const fromId = msg.getFromId()
    const isMe = () => fromId === 1
    const contact = this._dc.getContact(fromId)

    return {
      contact, isMe, fromId, msg
    }
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

  pageUp (height) {
    const rest = this._allLines.length - height
    if (rest > 0) {
      this._scrollback = Math.min(this._scrollback + 1, rest)
    }
  }

  pageDown () {
    this._scrollback = Math.max(0, this._scrollback - 1)
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

class StarPage extends AbstractPage {
  constructor (dc) {
    super('stars')
    this._dc = dc
  }

  lines () {
    return this._dc.getStarredMessages().map(messageId => {
      return new ChatMessage(messageId, this._dc)
    })
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
    this.append(new ChatMessage(messageId, this._dc))
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

class Controller {
  // The Controller is the container for a deltachat instance

  init (credentials) {
    var self = this
    this._page = 0
    this._pages = []

    // Creates a separate DB file for each login
    const dc = this._dc = new DeltaChat({
      addr: credentials.email,
      mail_pw: credentials.password,
      cwd: path.join(config.CONFIG_PATH, credentials.email)
    })
    dc.open()

    dc.on('ready', function () {
      self.loadChats()
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

    this._starPage = new StarPage(dc)
    this._pages.push(this._starPage)

    this._statusPage = new StatusPage()
    this._pages.push(this._statusPage)
  }

  loadChats () {
    this._getChats().forEach(id => this._loadChat(id))
  }

  _loadChat (chatId) {
    const chat = this._getChatPage(chatId)
    const messageIds = this._dc.getChatMessages(chatId, 0, 0)
    messageIds.forEach(id => chat.appendMessage(id))
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
    const index = this._pages.findIndex(page => {
      return page.chatId === chatId
    })
    if (index !== -1) {
      this._dc.deleteChat(chatId)
      if (index <= this._page) {
        this._page--
      }
      this._pages.splice(index, 1)
    }
  }

  archiveChat (chatId) {
    const index = this._pages.findIndex(page => {
      return page.chatId === chatId
    })
    if (index !== -1) {
      this._dc.archiveChat(chatId, true)
      if (index <= this._page) {
        this._page--
      }
      this._pages.splice(index, 1)
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
  }

  result (line) {
    this._statusPage.append(line)
  }

  warning (line) {
    this._statusPage.append(line)
  }

  error (line) {
    this._statusPage.append(line)
  }

  currentPage () {
    return this._pages[this._page]
  }

  currentPageIndex () {
    return this._page
  }

  setCurrentPageIndex (index) {
    if (index >= 0 && index <= this._pages.length - 1) {
      this._page = index
    }
  }

  isChat () {
    return typeof this.currentPage().chatId === 'number'
  }

  nextPage () {
    this._page = ((this._page + 1) % this._pages.length)
  }

  prevPage () {
    const newPage = this._page - 1
    this._page = newPage < 0 ? this._pages.length - 1 : newPage
  }

  _selectChatPage (chatId) {
    const index = this._pages.findIndex(p => p.chatId === chatId)
    if (index !== -1) {
      this._page = index
    }
  }

  _getChatPage (chatId) {
    let page = this._pages.find(p => p.chatId === chatId)
    if (!page) {
      page = new ChatPage(chatId, this._dc)
      // TODO we might want to tweak current this._page here
      this._pages.push(page)
      this._sortPages()
    }
    return page
  }

  _getChats () {
    return this._dc.getChats(CONSTANTS.DC_GCL_NO_SPECIALS)
  }

  _sortPages () {
    this._pages.sort((left, right) => {
      const leftName = left.name()
      const rightName = right.name()
      if (leftName === 'debug' ||
          leftName === 'status' ||
          leftName === 'stars') return -1

      if (leftName < rightName) return -1
      if (leftName === rightName) return 0

      return 1
    })
  }
}

module.exports = Controller
