const DeltaChat = require('deltachat-node')
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

    Object.keys(strings).forEach(key => {
      this._dc.setStockTranslation(Number(key), strings[key])
    })

    this._controller._sendStateToRenderer()
  }

  login (credentials, sendStateToRenderer, coreStrings, updateConfiguration) {
    // Creates a separate DB file for each login
    this._controller.accountDir = this.getPath(credentials.addr)
    log.info(`Using deltachat instance ${this._controller.accountDir}`)
    const dc = new DeltaChat()
    this._controller._dc = dc
    this._controller.credentials = credentials
    this._controller._sendStateToRenderer = sendStateToRenderer

    if (!DeltaChat.maybeValidAddr(credentials.addr)) {
      this._controller.emit('error', this._controller.translate('bad_email_address'))
      return
    }

    this._dc.open(this._controller.accountDir, err => {
      if (err) throw err
      this.setCoreStrings(coreStrings)
      const onReady = () => {
        log.info('Ready')
        this._controller.ready = true
        this._controller.configuring = false
        this._controller.emit('ready', this._controller.credentials)
        log.info('dc_get_info', dc.getInfo())
        sendStateToRenderer()
      }
      if (!this._dc.isConfigured() || updateConfiguration) {
        this._dc.once('ready', onReady)
        this._controller.configuring = true
        this._dc.configure(this.addServerFlags(credentials))
        sendStateToRenderer()
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
    if (typeof this._controller._sendStateToRenderer === 'function') this._controller._sendStateToRenderer()
  }

  getPath (addr) {
    return path.join(this._controller.cwd, Buffer.from(addr).toString('hex'))
  }

  close () {
    if (!this._dc) return
    this._dc.close()
    this._controller._dc = null
  }

  addServerFlags (credentials) {
    return Object.assign({}, credentials, {
      server_flags: this._controller.settings.serverFlags(credentials)
    })
  }
}
