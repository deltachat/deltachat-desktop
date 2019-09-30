const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
const log = require('../../logger').getLogger('main/deltachat/login')
const path = require('path')

/**
 * Called when this controller is created and when current
 * locale changes
 */
function setCoreStrings (strings) {
  if (!this._dc) return

  this._dc.clearStringTable()
  Object.keys(strings).forEach(key => {
    this._dc.setStringTable(Number(key), strings[key])
  })

  this._render()
}

function login (credentials, render, coreStrings) {
  // Creates a separate DB file for each login
  this.fullCwd = this.getPath(credentials.addr)
  log.info(`Using deltachat instance ${this.fullCwd}`)
  this._dc = new DeltaChat()
  const dc = this._dc
  this.credentials = credentials
  this._render = render

  this.setCoreStrings(coreStrings)

  if (!DeltaChat.maybeValidAddr(credentials.addr)) {
    this.emit('error', this.translate('bad_email_address'))
    return
  }

  dc.open(this.fullCwd, err => {
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
  this.registerEventHandler(dc)
}

function logout () {
  this.close()
  this._resetState()

  log.info('Logged out')
  this.emit('logout')
  if (typeof this._render === 'function') this._render()
}

function getPath (addr) {
  return path.join(this.cwd, Buffer.from(addr).toString('hex'))
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

function close () {
  if (!this._dc) return
  this._dc.close()
  this._dc = null
}

module.exports = function () {
  this.setCoreStrings = setCoreStrings.bind(this)
  this.login = login.bind(this)
  this.logout = logout.bind(this)
  this.close = close.bind(this)
  this.getPath = getPath.bind(this)
}
