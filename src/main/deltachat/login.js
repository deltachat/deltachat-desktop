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
  const cwd = getPath(this.cwd, credentials.addr)
  log.info(`Using deltachat instance ${cwd}`)
  this._dc = new DeltaChat()
  const dc = this._dc
  this.credentials = credentials
  this._render = render

  this.setCoreStrings(coreStrings)

  dc.open(cwd, err => {
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

    dc.on('ALL', (event, data1, data2) => {
      log.debug('ALL event', { event, data1, data2 })
    })

    dc.on('DC_EVENT_CONFIGURE_PROGRESS', progress => {
      this.logCoreEvent('DC_EVENT_CONFIGURE_PROGRESS', progress)
      if (Number(progress) === 0) { // login failed
        this.emit('DC_EVENT_LOGIN_FAILED')
        this.logout()
      }
    })

    dc.on('DC_EVENT_IMEX_FILE_WRITTEN', (filename) => {
      this.emit('DC_EVENT_IMEX_FILE_WRITTEN', filename)
    })

    dc.on('DC_EVENT_IMEX_PROGRESS', (progress) => {
      this.emit('DC_EVENT_IMEX_PROGRESS', progress)
    })

    dc.on('DC_EVENT_CONTACTS_CHANGED', (contactId) => {
      this.logCoreEvent('DC_EVENT_CONTACTS_CHANGED', contactId)
      render()
    })

    dc.on('DC_EVENT_MSGS_CHANGED', (chatId, msgId) => {
      // Don't rerender if a draft changes
      if (msgId === 0) return
      this.logCoreEvent('DC_EVENT_MSGS_CHANGED', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      this.emit('DC_EVENT_INCOMING_MSG', chatId, msgId)
      this.logCoreEvent('DC_EVENT_INCOMING_MSG', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_MSG_DELIVERED', (chatId, msgId) => {
      this.logCoreEvent('EVENT msg delivered', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_MSG_FAILED', (chatId, msgId) => {
      this.logCoreEvent('EVENT msg failed to deliver', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_MSG_READ', (chatId, msgId) => {
      this.logCoreEvent('DC_EVENT_MSG_DELIVERED', { chatId, msgId })
      render()
    })

    dc.on('DC_EVENT_WARNING', (warning) => {
      log.warn(warning)
    })

    const onError = error => {
      this.emit('error', error)
      log.error(error)
    }

    dc.on('DC_EVENT_ERROR', (error) => {
      onError(error)
    })

    dc.on('DC_EVENT_ERROR_NETWORK', (first, error) => {
      onError(error)
    })

    dc.on('DC_EVENT_ERROR_SELF_NOT_IN_GROUP', (error) => {
      onError(error)
    })
  })
}

function getPath (cwd, addr) {
  return path.join(cwd, Buffer.from(addr).toString('hex'))
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

function logout () {
  this.close()
  this._resetState()

  log.info('Logged out')
  this.emit('logout')
  if (typeof this._render === 'function') this._render()
}

function close () {
  if (!this._dc) return
  this._dc.close()
  this._dc = null
}


function addServerFlags (credentials) {
  return Object.assign({}, credentials, {
    serverFlags: serverFlags(credentials)
  })
}

module.exports = function () {
  this.setCoreStrings = setCoreStrings.bind(this)
  this.login = login.bind(this)
  this.logout = logout.bind(this)
  this.close = close.bind(this)
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
