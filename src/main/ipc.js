module.exports = {
  init
}

const {
  app,
  ipcMain
} = require('electron')

const path = require('path')
const fs = require('fs')
const os = require('os')

const localize = require('../localize')
const menu = require('./menu')
const windows = require('./windows')
const log = require('./log')
const DeltaChat = require('./deltachat')
const C = require('deltachat-node/constants')
const setupNotifications = require('./notifications')

function init (cwd, state) {
  // Events dispatched by buttons from the frontend

  const ipc = ipcMain
  const main = windows.main

  const dc = new DeltaChat(cwd, state.saved)

  dc.on('ready', function () {
    if (!app.logins.includes(dc.credentials.addr)) {
      app.logins.push(dc.credentials.addr)
    }
  })

  ipc.once('ipcReady', function (e) {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipc.on('setAspectRatio', (e, ...args) => main.setAspectRatio(...args))
  ipc.on('setBounds', (e, ...args) => main.setBounds(...args))
  ipc.on('setProgress', (e, ...args) => main.setProgress(...args))
  ipc.on('show', () => main.show())
  ipc.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))
  ipc.on('chooseLanguage', (e, locale) => {
    localize.setup(app, locale)
    dc.setCoreStrings(txCoreStrings())
    menu.init()
  })

  setupNotifications(dc, state.saved)

  // Called once to get the conversations css string
  ipc.on('get-css', (e) => {
    const p = require.resolve('../../conversations/build/manifest.css')
    e.returnValue = fs.readFileSync(p).toString()
  })

  // Create a new instance
  ipc.on('login', (e, ...args) => {
    dc.login(...args, render, txCoreStrings())
  })

  ipc.on('forgetLogin', (e, addr) => {
    var targetDir = dc.getPath(addr)
    fs.rmdirSync(targetDir)
    app.logins.splice(app.logins.indexOf(addr))
    render()
  })

  dc.on('DC_EVENT_IMEX_FILE_WRITTEN', (filename) => {
    windows.main.send('DC_EVENT_IMEX_FILE_WRITTEN', filename)
  })

  dc.on('DC_EVENT_IMEX_PROGRESS', (progress) => {
    windows.main.send('DC_EVENT_IMEX_PROGRESS', progress)
  })

  dc.on('DC_EVENT_ERROR', (error) => {
    windows.main.send('error', error)
  })

  dc.on('DC_EVENT_ERROR_NETWORK', (first, error) => {
    windows.main.send('error', error)
  })

  dc.on('DC_EVENT_CONFIGURE_PROGRESS', function (data1) {
    if (Number(data1) === 0) { // login failed
      windows.main.send('error', 'Login failed!')
    }
  })

  // Calls a function directly in the deltachat-node instance and returns the
  // value (sync)
  ipc.on('dispatchSync', (e, ...args) => {
    e.returnValue = dispatch(...args)
  })

  // Calls the function without returning the value (async)
  ipc.on('dispatch', (e, ...args) => {
    dispatch(...args)
  })

  ipc.on('initiateKeyTransfer', (e, ...args) => {
    dc.initiateKeyTransfer((err, resp) => {
      windows.main.send('initiateKeyTransferResp', err, resp)
    })
  })

  ipc.on('continueKeyTransfer', (e, messageId, setupCode) => {
    dc.continueKeyTransfer(messageId, setupCode, function (err) {
      windows.main.send('continueKeyTransferResp', err)
    })
  })

  ipc.on('saveFile', (e, source, target) => {
    fs.copyFile(source, target, function (err) {
      if (err) windows.main.send('error', err.message)
    })
  })

  ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
      file: filePath,
      icon: ''
    })
  })

  // This needs to be JSON serializable for rendering to the frontend.
  ipc.on('render', render)
  ipc.on('locale-data', (e, locale) => {
    if (locale) app.localeData = localize.setup(app, locale)
    e.returnValue = app.localeData
  })

  ipc.on('updateSettings', (e, saved) => {
    dc.updateSettings(saved)
  })

  ipc.on('updateCredentials', (e, credentials) => {
    var dir = path.join(os.tmpdir(), Date.now().toString())
    if (!credentials.mailPw) credentials.mailPw = dc.getConfig('mail_pw')
    var tmp = new DeltaChat(dir, state.saved)

    tmp.on('DC_EVENT_CONFIGURE_PROGRESS', function (data1) {
      if (Number(data1) === 0) { // login failed
        windows.main.send('error', 'Login failed')
        tmp.close()
      }
    })

    function fakeRender () {
      var json = dc.render()
      var tmpJson = tmp.render()
      json.configuring = tmpJson.configuring
      windows.main.send('render', json)
      if (tmpJson.ready) {
        dc.login(credentials, render, txCoreStrings())
        windows.main.send('success', 'Configuration success!')
        tmp.close()
      }
    }

    tmp.login(credentials, fakeRender, txCoreStrings())
  })

  function dispatch (name, ...args) {
    const handler = dc[name]
    if (!handler) throw new Error(`fn with name ${name} does not exist`)
    return handler.call(dc, ...args)
  }

  function render () {
    log('RENDER')
    const json = dc.render()
    windows.main.setTitle(json.credentials.addr)
    windows.main.send('render', json)
  }
}

function txCoreStrings () {
  const tx = app.translate
  const strings = {}

  strings[C.DC_STR_NOMESSAGES] = tx('DC_STR_NOMESSAGES')
  strings[C.DC_STR_SELF] = tx('DC_STR_SELF')
  strings[C.DC_STR_DRAFT] = tx('DC_STR_DRAFT')
  strings[C.DC_STR_MEMBER] = tx('DC_STR_MEMBER')
  strings[C.DC_STR_CONTACT] = tx('DC_STR_CONTACT')
  strings[C.DC_STR_VOICEMESSAGE] = tx('DC_STR_VOICEMESSAGE')
  strings[C.DC_STR_DEADDROP] = tx('DC_STR_DEADDROP')
  strings[C.DC_STR_IMAGE] = tx('DC_STR_IMAGE')
  strings[C.DC_STR_GIF] = tx('DC_STR_GIF')
  strings[C.DC_STR_VIDEO] = tx('DC_STR_VIDEO')
  strings[C.DC_STR_AUDIO] = tx('DC_STR_AUDIO')
  strings[C.DC_STR_FILE] = tx('DC_STR_FILE')
  strings[C.DC_STR_ENCRYPTEDMSG] = tx('DC_STR_ENCRYPTEDMSG')
  strings[C.DC_STR_STATUSLINE] = tx('DC_STR_STATUSLINE')
  strings[C.DC_STR_NEWGROUPDRAFT] = tx('DC_STR_NEWGROUPDRAFT')
  strings[C.DC_STR_MSGGRPNAME] = tx('DC_STR_MSGGRPNAME')
  strings[C.DC_STR_MSGGRPIMGCHANGED] = tx('DC_STR_MSGGRPIMGCHANGED')
  strings[C.DC_STR_MSGADDMEMBER] = tx('DC_STR_MSGADDMEMBER')
  strings[C.DC_STR_MSGDELMEMBER] = tx('DC_STR_MSGDELMEMBER')
  strings[C.DC_STR_MSGGROUPLEFT] = tx('DC_STR_MSGGROUPLEFT')
  strings[C.DC_STR_E2E_AVAILABLE] = tx('DC_STR_E2E_AVAILABLE')
  strings[C.DC_STR_ENCR_TRANSP] = tx('DC_STR_ENCR_TRANSP')
  strings[C.DC_STR_ENCR_NONE] = tx('DC_STR_ENCR_NONE')
  strings[C.DC_STR_FINGERPRINTS] = tx('DC_STR_FINGERPRINTS')
  strings[C.DC_STR_READRCPT] = tx('DC_STR_READRCPT')
  strings[C.DC_STR_READRCPT_MAILBODY] = tx('DC_STR_READRCPT_MAILBODY')
  strings[C.DC_STR_MSGGRPIMGDELETED] = tx('DC_STR_MSGGRPIMGDELETED')
  strings[C.DC_STR_E2E_PREFERRED] = tx('DC_STR_E2E_PREFERRED')
  strings[C.DC_STR_ARCHIVEDCHATS] = tx('DC_STR_ARCHIVEDCHATS')
  strings[C.DC_STR_STARREDMSGS] = tx('DC_STR_STARREDMSGS')
  strings[C.DC_STR_AC_SETUP_MSG_SUBJECT] = tx('DC_STR_AC_SETUP_MSG_SUBJECT')
  strings[C.DC_STR_AC_SETUP_MSG_BODY] = tx('DC_STR_AC_SETUP_MSG_BODY')
  strings[C.DC_STR_SELFTALK_SUBTITLE] = tx('DC_STR_SELFTALK_SUBTITLE')
  strings[C.DC_STR_CANTDECRYPT_MSG_BODY] = tx('DC_STR_CANTDECRYPT_MSG_BODY')
  strings[C.DC_STR_CANNOT_LOGIN] = tx('DC_STR_CANNOT_LOGIN')
  strings[C.DC_STR_SERVER_RESPONSE] = tx('DC_STR_SERVER_RESPONSE')

  return strings
}
