const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/login', true)
const path = require('path')
const setupNotifications = require('../notifications')
const setupUnreadBadgeCounter = require('../unread-badge')
const { setupMarkseenFix } = require('../markseenFix')
const { app } = require('electron')

const SplitOut = require('./splitout')
module.exports = class DCLoginController extends SplitOut {
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

    this._controller._render()
  }

  login (credentials, render, coreStrings) {
    // Creates a separate DB file for each login
    this._controller.fullCwd = this.getPath(credentials.addr)
    log.info(`Using deltachat instance ${this._controller.fullCwd}`)
    const dc = new DeltaChat()
    this._controller._dc = dc
    this._controller.credentials = credentials
    this._controller._render = render

    this.setCoreStrings(coreStrings)

    if (!DeltaChat.maybeValidAddr(credentials.addr)) {
      this._controller.emit('error', this._controller.translate('bad_email_address'))
      return
    }

    this._dc.open(this._controller.fullCwd, err => {
      if (err) throw err
      const onReady = () => {
        log.info('Ready')
        this._controller.ready = true
        this._controller.configuring = false
        this._controller.emit('ready', this._controller.credentials)
        log.info('dc_get_info', dc.getInfo())
        render()
      }
      if (!this._dc.isConfigured()) {
        this._dc.once('ready', onReady)
        this._controller.configuring = true
        this._dc.configure(addServerFlags(credentials))
        render()
      } else {
        onReady()
      }
    })
    this._controller.registerEventHandler(dc)
    setupNotifications(this._controller, app.state.saved)
    setupUnreadBadgeCounter(this._controller)
    setupMarkseenFix(this._controller)
  }

  logout () {
    this.close()
    this._controller._resetState()

    log.info('Logged out')
    this._controller.emit('logout')
    if (typeof this._controller._render === 'function') this._controller._render()
  }

  getPath (addr) {
    return path.join(this._controller.cwd, Buffer.from(addr).toString('hex'))
  }

  close () {
    if (!this._dc) return
    this._dc.close()
    this._controller._dc = null
  }
}

function addServerFlags (credentials) {
  return Object.assign({}, credentials, {
    serverFlags: serverFlags(credentials)
  })
}

function serverFlags ({ mailSecurity, sendSecurity }) {
  const flags = []

  if (mailSecurity === 'ssl') {
    flags.push(C.DC_LP_IMAP_SOCKET_SSL)
  } else if (mailSecurity === 'starttls') {
    flags.push(C.DC_LP_IMAP_SOCKET_STARTTLS)
  } else if (mailSecurity === 'plain') {
    flags.push(C.DC_LP_IMAP_SOCKET_PLAIN)
  }

  if (sendSecurity === 'ssl') {
    flags.push(C.DC_LP_SMTP_SOCKET_SSL)
  } else if (sendSecurity === 'starttls') {
    flags.push(C.DC_LP_SMTP_SOCKET_STARTTLS)
  } else if (sendSecurity === 'plain') {
    flags.push(C.DC_LP_SMTP_SOCKET_PLAIN)
  }

  if (!flags.length) return null

  return flags.reduce((flag, acc) => {
    return acc | flag
  }, 0)
}
