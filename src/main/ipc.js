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
const DeltaChat = (() => {
  try {
    return require('./deltachat')
  } catch (error) {
    log.critical('Fatal: The DeltaChat Module couldn\'t be loaded. Please check if all dependencies for deltachat-core are installed!', error)
    const { dialog } = require('electron')
    const { getLogsPath } = require('../application-constants')
    dialog.showErrorBox('Fatal Error', `The DeltaChat Module couldn't be loaded.\n Please check if all dependencies for deltachat-core are installed!\n The Log file is located in this folder: ${getLogsPath()}`)
  }
})()
const C = require('deltachat-node/constants')
const setupNotifications = require('./notifications')
const setupUnreadBadgeCounter = require('./unread-badge')

function init (cwd, state, logHandler) {
  const main = windows.main
  const dc = new DeltaChat(cwd, state.saved)

  dc.on('ready', credentials => {
    if (!state.logins.includes(credentials.addr)) {
      state.logins.push(credentials.addr)
    }
    state.saved.credentials = credentials
    app.saveState()
  })

  dc.on('logout', () => {
    state.saved.credentials = null
    app.saveState()
  })

  dc.on('DC_EVENT_IMEX_FILE_WRITTEN', filename => {
    log.debug('DC_EVENT_IMEX_FILE_WRITTEN: ' + filename)
    main.send('DC_EVENT_IMEX_FILE_WRITTEN', filename)
  })

  dc.on('DC_EVENT_IMEX_PROGRESS', progress => {
    main.send('DC_EVENT_IMEX_PROGRESS', progress)
  })

  dc.on('error', error => main.send('error', error))

  dc.on('DC_EVENT_LOGIN_FAILED', () => main.send('error', 'Login failed!'))

  ipcMain.once('ipcReady', e => {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipcMain.on('setAspectRatio', (e, ...args) => main.setAspectRatio(...args))
  ipcMain.on('setBounds', (e, ...args) => main.setBounds(...args))
  ipcMain.on('setProgress', (e, ...args) => main.setProgress(...args))
  ipcMain.on('show', () => main.show())
  ipcMain.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))
  ipcMain.on('chooseLanguage', (e, locale) => {
    localize.setup(app, locale)
    dc.setCoreStrings(txCoreStrings())
    menu.init(logHandler)
  })

  ipcMain.on('handleLogMessage', (e, ...args) => logHandler.log(...args))

  setupNotifications(dc, state.saved)
  setupUnreadBadgeCounter(dc)

  ipcMain.on('login', (e, credentials) => {
    dc.login(credentials, render, txCoreStrings())
  })

  ipcMain.on('forgetLogin', (e, addr) => {
    rimraf.sync(dc.getPath(addr))
    state.logins.splice(state.logins.indexOf(addr), 1)
    render()
  })

  ipcMain.on('sendMessage', (e, chatId, text, fileName) => {
    dc.sendMessage(chatId, text, fileName)
  })

  ipcMain.on('fetchMessages', () => dc.fetchMessages())
  ipcMain.on('fetchChats', () => dc.fetchChats())

  ipcMain.on('getChatContacts', (e, chatId) => {
    e.returnValue = dc.getChatContacts(chatId)
  })

  ipcMain.on('modifyGroup', (e, chatId, name, image, remove, add) => {
    dc.modifyGroup(chatId, name, image, remove, add)
  })

  ipcMain.on('leaveGroup', (e, chatId) => dc.leaveGroup(chatId))

  ipcMain.on('archiveChat', (e, chatId, archive) => {
    dc.archiveChat(chatId, archive)
  })

  ipcMain.on('createChatByContactId', (e, contactId) => {
    e.returnValue = dc.createChatByContactId(contactId)
  })

  ipcMain.on('createContact', (e, name, email) => {
    e.returnValue = dc.createContact(name, email)
  })

  ipcMain.on('chatWithContact', (e, deadDrop) => dc.chatWithContact(deadDrop))

  ipcMain.on('blockContact', (e, id) => dc.blockContact(id))
  ipcMain.on('unblockContact', (e, id) => dc.unblockContact(id))

  ipcMain.on('getContacts', (e, listFlags, queryStr) => {
    e.returnValue = dc.getContacts(listFlags, queryStr)
  })

  ipcMain.on('showArchivedChats', (e, show) => dc.showArchivedChats(show))

  ipcMain.on('createGroupChat', (e, verified, name, image, contactIds) => {
    e.returnValue = dc.createGroupChat(verified, name, image, contactIds)
  })

  ipcMain.on('selectChat', (e, chatId) => dc.selectChat(chatId))

  ipcMain.on('getChatById', (e, chatId) => main.send('getChatById', dc._getChatById(chatId)))

  ipcMain.on('searchChats', (e, queryStr) => dc.searchChats(queryStr))

  ipcMain.on('deleteChat', (e, chatId) => dc.deleteChat(chatId))

  ipcMain.on('contactRequests', () => dc.contactRequests())

  ipcMain.on('getEncrInfo', (e, contactId) => {
    e.returnValue = dc.getEncrInfo(contactId)
  })

  ipcMain.on('getChatMedia', (e, msgType1, msgType2) => {
    e.returnValue = dc.getChatMedia(msgType1, msgType2)
  })

  ipcMain.on('deleteMessage', (e, id) => dc.deleteMessage(id))

  ipcMain.on('forwardMessage', (e, msgId, contactId) => {
    dc.forwardMessage(msgId, contactId)
  })

  ipcMain.on('getQrCode', (e, chatId) => {
    e.returnValue = dc.getQrCode(chatId)
  })

  ipcMain.on('backupImport', (e, fileName) => dc.backupImport(fileName))
  ipcMain.on('backupExport', (e, dir) => dc.backupExport(dir))

  ipcMain.on('keysImport', (e, dir) => dc.keysImport(dir))
  ipcMain.on('keysExport', (e, dir) => dc.keysExport(dir))

  ipcMain.on('setConfig', (e, key, value) => {
    e.returnValue = dc.setConfig(key, value)
  })

  ipcMain.on('getConfigFor', (e, keys) => {
    e.returnValue = dc.getConfigFor(keys)
  })

  ipcMain.on('getDCinfo', () => {
    main.send('dcInfo', dc.getInfo())
  })

  ipcMain.on('logout', () => dc.logout())

  ipcMain.on('initiateKeyTransfer', (e) => {
    dc.initiateKeyTransfer((err, resp) => {
      main.send('initiateKeyTransferResp', err, resp)
    })
  })

  ipcMain.on('continueKeyTransfer', (e, messageId, setupCode) => {
    dc.continueKeyTransfer(messageId, setupCode, err => {
      main.send('continueKeyTransferResp', err)
    })
  })

  ipcMain.on('saveFile', (e, source, target) => {
    fs.copyFile(source, target, err => {
      if (err) main.send('error', err.message)
    })
  })

  ipcMain.on('setLocation', (e, latitude, longitude, accuracy) => {
    e.returnValue = dc.setLocation(latitude, longitude, accuracy)
  })

  ipcMain.on('getLocations', (e, chatId, contactId, timestampFrom, timestampTo) => {
    e.returnValue = dc.getLocations(chatId, contactId, timestampFrom, timestampTo)
  })

  ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({ file: filePath, icon: '' })
  })

  ipcMain.on('render', render)

  ipcMain.on('locale-data', (e, locale) => {
    if (locale) app.localeData = localize.setup(app, locale)
    e.returnValue = app.localeData
  })

  ipcMain.on('updateSettings', (e, saved) => {
    dc.updateSettings(saved)
    app.saveState()
    render()
  })

  ipcMain.on('updateCredentials', (e, credentials) => {
    const dir = path.join(os.tmpdir(), Date.now().toString())
    if (!credentials.mailPw) credentials.mailPw = dc.getConfig('mail_pw')
    const tmp = new DeltaChat(dir, state.saved)

    tmp.on('error', error => main.send('error', error))

    function fakeRender () {
      const deltachat = dc.render()
      const tmpDeltachat = tmp.render()
      deltachat.configuring = tmpDeltachat.configuring
      sendState(deltachat)
      if (tmpDeltachat.ready) {
        dc.login(credentials, render, txCoreStrings())
        main.send('success', 'Configuration success!')
        tmp.close()
      }
    }

    tmp.login(credentials, fakeRender, txCoreStrings())
  })

  ipcMain.on('setDraft', (event, chatId, msg) => {
    dc.setDraft(chatId, msg)
  })

  function render () {
    log.debug('RENDER')
    const deltachat = dc.render()
    main.setTitle(deltachat.credentials.addr)
    sendState(deltachat)
  }

  function sendState (deltachat) {
    Object.assign(state, { deltachat })
    main.send('render', state)
  }

  const savedCredentials = state.saved.credentials
  if (savedCredentials &&
      typeof savedCredentials === 'object' &&
      Object.keys(savedCredentials).length !== 0) {
    dc.login(savedCredentials, render, txCoreStrings())
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
