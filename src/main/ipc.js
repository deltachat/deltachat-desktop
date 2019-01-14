module.exports = { init }

const { app, ipcMain } = require('electron')
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')
const os = require('os')

const localize = require('../localize')
const menu = require('./menu')
const windows = require('./windows')
const log = require('../logger').getLogger('main/ipc')
const DeltaChat = require('./deltachat')
const C = require('deltachat-node/constants')
const setupNotifications = require('./notifications')
const logHandler = require('./developerTools/logHandler')

function init (cwd, state) {
  const ipc = ipcMain
  const main = windows.main
  const dc = new DeltaChat(cwd, state.saved)

  dc.on('ready', function () {
    if (!state.logins.includes(dc.credentials.addr)) {
      state.logins.push(dc.credentials.addr)
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

  ipc.on('handleLogMessage', (e, ...args) => logHandler.log(...args))

  setupNotifications(dc, state.saved)

  // Create a new instance
  ipc.on('login', (e, ...args) => {
    dc.login(...args, render, txCoreStrings())
  })

  ipc.on('forgetLogin', (e, addr) => {
    var targetDir = dc.getPath(addr)
    rimraf.sync(targetDir)
    state.logins.splice(state.logins.indexOf(addr), 1)
    render()
  })

  dc.on('DC_EVENT_IMEX_FILE_WRITTEN', (filename) => {
    windows.main.send('DC_EVENT_IMEX_FILE_WRITTEN', filename)
  })

  dc.on('DC_EVENT_IMEX_PROGRESS', (progress) => {
    windows.main.send('DC_EVENT_IMEX_PROGRESS', progress)
  })

  dc.on('error', (error) => {
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

  ipc.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({ file: filePath, icon: '' })
  })

  ipc.on('render', render)

  ipc.on('locale-data', (e, locale) => {
    if (locale) app.localeData = localize.setup(app, locale)
    e.returnValue = app.localeData
  })

  ipc.on('updateSettings', (e, saved) => {
    dc.updateSettings(saved)
    app.saveState()
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
      const deltachat = dc.render()
      const tmpDeltachat = tmp.render()
      deltachat.configuring = tmpDeltachat.configuring
      sendState(deltachat)
      if (tmpDeltachat.ready) {
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
    log.debug('RENDER')
    const deltachat = dc.render()
    windows.main.setTitle(deltachat.credentials.addr)
    sendState(deltachat)
  }

  function sendState (deltachat) {
    Object.assign(state, { deltachat })
    windows.main.send('render', state)
  }
}

function txCoreStrings () {
  const tx = app.translate
  const strings = {}
  // TODO: Check if we need the uncommented core translations
  strings[C.DC_STR_NOMESSAGES] = tx('chat_no_messages')
  strings[C.DC_STR_SELF] = tx('self')
  strings[C.DC_STR_DRAFT] = tx('draft')
  strings[C.DC_STR_MEMBER] = tx('n_members', '%1$s', 'other')
  strings[C.DC_STR_CONTACT] = tx('n_contacts', '%1$s', 'other')
  strings[C.DC_STR_VOICEMESSAGE] = tx('voice_message')
  strings[C.DC_STR_DEADDROP] = tx('login_inbox')
  strings[C.DC_STR_IMAGE] = tx('image')
  strings[C.DC_STR_GIF] = tx('gif')
  strings[C.DC_STR_VIDEO] = tx('video')
  strings[C.DC_STR_AUDIO] = tx('audio')
  strings[C.DC_STR_FILE] = tx('file')
  strings[C.DC_STR_ENCRYPTEDMSG] = tx('encrypted_message')
  strings[C.DC_STR_STATUSLINE] = tx('pref_default_status_text')
  strings[C.DC_STR_NEWGROUPDRAFT] = tx('group_hello_draft')
  strings[C.DC_STR_MSGGRPNAME] = tx('systemmsg_group_name_changed')
  strings[C.DC_STR_MSGGRPIMGCHANGED] = tx('systemmsg_group_image_changed')
  strings[C.DC_STR_MSGADDMEMBER] = tx('systemmsg_member_added')
  strings[C.DC_STR_MSGDELMEMBER] = tx('systemmsg_member_removed')
  strings[C.DC_STR_MSGGROUPLEFT] = tx('systemmsg_group_left')
  // strings[C.DC_STR_E2E_AVAILABLE] = tx('DC_STR_E2E_AVAILABLE')
  // strings[C.DC_STR_ENCR_TRANSP] = tx('DC_STR_ENCR_TRANSP')
  // strings[C.DC_STR_ENCR_NONE] = tx('DC_STR_ENCR_NONE')
  strings[C.DC_STR_FINGERPRINTS] = tx('qrscan_fingerprint_label')
  strings[C.DC_STR_READRCPT] = tx('systemmsg_read_receipt_subject')
  strings[C.DC_STR_READRCPT_MAILBODY] = tx('systemmsg_read_receipt_body')
  strings[C.DC_STR_MSGGRPIMGDELETED] = tx('systemmsg_group_image_deleted')
  strings[C.DC_STR_E2E_PREFERRED] = tx('autocrypt_prefer_e2ee')
  strings[C.DC_STR_ARCHIVEDCHATS] = tx('chat_archived_chats_title')
  // strings[C.DC_STR_STARREDMSGS] = tx('DC_STR_STARREDMSGS')
  strings[C.DC_STR_AC_SETUP_MSG_SUBJECT] = tx('autocrypt_asm_subject')
  strings[C.DC_STR_AC_SETUP_MSG_BODY] = tx('autocrypt_asm_general_body')
  strings[C.DC_STR_SELFTALK_SUBTITLE] = tx('chat_self_talk_subtitle')
  strings[C.DC_STR_CANTDECRYPT_MSG_BODY] = tx('systemmsg_cannot_decrypt')
  strings[C.DC_STR_CANNOT_LOGIN] = tx('login_error_cannot_login')
  strings[C.DC_STR_SERVER_RESPONSE] = tx('login_error_server_response')

  return strings
}
