module.exports = { init }

const { app, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const { getLogins, removeAccount, getNewAccountPath } = require('./logins')
const { getConfigPath } = require('../application-constants')

const localize = require('../localize')
const menu = require('./menu')
const windows = require('./windows')
const log = require('../logger').getLogger('main/ipc')
const DeltaChatController = (() => {
  try {
    return require('./deltachat/controller')
  } catch (error) {
    log.critical('Fatal: The DeltaChat Module couldn\'t be loaded. Please check if all dependencies for deltachat-core are installed!', error)
    const { dialog } = require('electron')
    const { getLogsPath } = require('../application-constants')
    dialog.showErrorBox('Fatal Error', `The DeltaChat Module couldn't be loaded.\n Please check if all dependencies for deltachat-core are installed!\n The Log file is located in this folder: ${getLogsPath()}`)
  }
})()
const C = require('deltachat-node/constants')

function init (cwd, state, logHandler) {
  const main = windows.main
  const dcController = new DeltaChatController(cwd, state.saved)

  dcController.on('ready', async credentials => {
    if (!state.logins.find(({ addr }) => addr === credentials.addr)) {
      state.logins = await getLogins()
    }
    state.saved.credentials = credentials
    delete state.saved.credentials.mail_pw
    delete state.saved.credentials.send_pw
    app.saveState()
  })

  dcController.on('logout', () => {
    state.saved.credentials = null
    app.saveState()
  })

  dcController.on('DC_EVENT_IMEX_FILE_WRITTEN', filename => {
    log.debug('DC_EVENT_IMEX_FILE_WRITTEN: ' + filename)
    main.send('DC_EVENT_IMEX_FILE_WRITTEN', filename)
  })

  dcController.on('DC_EVENT_IMEX_PROGRESS', progress => {
    main.send('DC_EVENT_IMEX_PROGRESS', progress)
  })

  dcController.on('error', error => main.send('error', error))

  dcController.on('DC_EVENT_LOGIN_FAILED', () => main.send('error', 'Login failed!'))

  ipcMain.once('ipcReady', e => {
    app.ipcReady = true
    app.emit('ipcReady')
  })

  ipcMain.on('all', (e, ...args) => {
    log.debug('Renderer event:', e, ...args)
  })

  ipcMain.on('setAspectRatio', (e, ...args) => main.setAspectRatio(...args))
  ipcMain.on('setBounds', (e, ...args) => main.setBounds(...args))
  ipcMain.on('setProgress', (e, ...args) => main.setProgress(...args))
  ipcMain.on('show', () => main.show())
  ipcMain.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))
  ipcMain.on('chooseLanguage', (e, locale) => {
    localize.setup(app, locale)
    dcController.loginController.setCoreStrings(txCoreStrings())
    menu.init(logHandler)
  })

  /* dispatch a method on DC core */
  ipcMain.on('EVENT_DC_DISPATCH', (e, identifier, methodName, args) => {
    if (!Array.isArray(args)) args = [args]
    log.debug('EVENT_DC_DISPATCH: ', methodName, args)
    dcController.callMethod(e, methodName, args)
  })

  /* dispatch a method on DC core with result passed to callback */
  ipcMain.on('EVENT_DC_DISPATCH_CB', async (e, identifier, methodName, args) => {
    if (!Array.isArray(args)) args = [args]
    log.debug(`EVENT_DC_DISPATCH_CB (${identifier}) : ${methodName} ${args}`)
    const returnValue = await dcController.callMethod(e, methodName, args)
    main.send(`EVENT_DD_DISPATCH_RETURN_${identifier}_${methodName}`, returnValue)
  })

  ipcMain.on('handleLogMessage', (e, ...args) => logHandler.log(...args))

  ipcMain.on('login', (e, credentials) => {
    dcController.loginController.login(
      getNewAccountPath(credentials.addr),
      credentials,
      sendStateToRenderer,
      txCoreStrings()
    )
  })

  ipcMain.on('loadAccount', (e, login) => {
    dcController.loginController.login(
      login.path,
      { addr: login.addr, mail_pw: true },
      sendStateToRenderer,
      txCoreStrings()
    )
  })

  const updateLogins = async () => {
    state.logins = await getLogins()
    sendStateToRenderer()
  }

  ipcMain.on('forgetLogin', async (e, login) => {
    try {
      await removeAccount(login.path)
      main.send('success', 'successfully forgot account')
    } catch (error) {
      main.send('error', error.message)
    }
    updateLogins()
  })

  ipcMain.on('updateLogins', updateLogins)

  ipcMain.on('getMessage', (e, msgId) => {
    e.returnValue = dcController.messageList.messageIdToJson(msgId)
  })

  /* unused
  ipcMain.on('getChatContacts', (e, chatId) => {
    e.returnValue = dc.chat.getChatContacts(chatId)
  })
  */

  ipcMain.on('backupImport', (e, fileName) => dcController.backup.import(fileName))
  ipcMain.on('backupExport', (e, dir) => dcController.backup.export(dir))

  ipcMain.on('setConfig', (e, key, value) => {
    e.returnValue = dcController.settings.setConfig(key, value)
  })

  ipcMain.on('logout', () => dcController.loginController.logout())

  ipcMain.on('initiateKeyTransfer', (e) => {
    dcController.autocrypt.initiateKeyTransfer((err, resp) => {
      main.send('initiateKeyTransferResp', err, resp)
    })
  })

  ipcMain.on('continueKeyTransfer', (e, messageId, setupCode) => {
    dcController.autocrypt.continueKeyTransfer(messageId, setupCode, err => {
      main.send('continueKeyTransferResp', err)
    })
  })

  ipcMain.on('saveFile', (e, source, target) => {
    fs.copyFile(source, target, err => {
      if (err) main.send('error', err.message)
    })
  })

  ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({ file: filePath, icon: '' })
  })

  ipcMain.on('render', sendStateToRenderer)

  ipcMain.on('locale-data', (e, locale) => {
    if (locale) app.localeData = localize.setup(app, locale)
    e.returnValue = app.localeData
  })

  const updateDesktopSetting = (e, key, value) => {
    const { saved } = app.state
    saved[key] = value
    app.saveState({ saved })
    sendStateToRenderer()
  }
  ipcMain.on('updateDesktopSetting', updateDesktopSetting)

  ipcMain.on('selectBackgroundImage', (e, file) => {
    const copyAndSetBg = async (originalfile) => {
      await fs.ensureDir(path.join(getConfigPath(), 'background/'))
      await fs.emptyDir(path.join(getConfigPath(), 'background/'))
      const newPath = path.join(getConfigPath(), 'background/', `background_${Date.now()}` + path.extname(originalfile))
      fs.copyFile(originalfile, newPath, (err) => {
        if (err) {
          log.error('BG-IMG Copy Failed', err)
          return
        }
        updateDesktopSetting(null, 'chatViewBgImg', `url("${newPath.replace(/\\/g, '/')}")`)
      })
    }
    if (!file) {
      dialog.showOpenDialog(undefined, {
        title: 'Select Background Image',
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      }, (filenames) => {
        if (!filenames) { return }
        log.info('BG-IMG Selected File:', filenames[0])
        copyAndSetBg(filenames[0])
      })
    } else {
      const filepath = path.join(__dirname, '../../images/backgrounds/', file)
      copyAndSetBg(filepath)
    }
  })

  ipcMain.on('updateCredentials', (e, credentials) => {
    const dir = path.join(os.tmpdir(), Date.now().toString())
    if (!credentials.mail_pw) credentials.mail_pw = dcController.settings.getConfig('mail_pw')
    // create a new instance to test the new login credentials
    const tmp = new DeltaChatController(dir, state.saved)

    tmp.on('error', error => main.send('error', error))

    function onReadyCallback () {
      const deltachat = dcController.getState()
      const tmpDeltachat = tmp.getState()
      deltachat.configuring = tmpDeltachat.configuring
      sendState(deltachat)
      if (tmpDeltachat.ready) {
        // test login was successfull so we log in with the current account to update the DB config
        dcController.loginController.login(
          dcController.accountDir,
          credentials,
          sendStateToRenderer,
          txCoreStrings(),
          true
        )
        main.send('success', 'Configuration success!')
        tmp.loginController.close()
      }
    }
    // test login with a temporary instance
    tmp.loginController.login(
      dcController.accountDir,
      credentials,
      onReadyCallback,
      txCoreStrings()
    )
  })

  ipcMain.on('cancelCredentialsUpdate', () => {
    const deltachat = dcController.getState()
    deltachat.configuring = false
    sendState(deltachat)
  })

  function sendStateToRenderer () {
    log.debug('RENDER')
    const deltachat = dcController.getState()
    main.setTitle(deltachat.credentials.addr)
    sendState(deltachat)
  }

  function sendState (deltachat) {
    Object.assign(state, { deltachat })
    main.send('render', state)
  }

  // if we find saved credentials we login in with these
  // which will create a new Deltachat instance which
  // is bound to a certain account
  const savedCredentials = state.saved.credentials
  if (savedCredentials &&
      typeof savedCredentials === 'object' &&
      Object.keys(savedCredentials).length !== 0) {
    const selectedAccount = state.logins.find(account => account.addr === savedCredentials.addr)

    if (selectedAccount) {
      dcController.loginController.login(
        selectedAccount.path,
        savedCredentials,
        sendStateToRenderer,
        txCoreStrings()
      )
    } else {
      log.error('Previous account not found!', state.saved.credentials, 'is not in the list of found logins:', state.logins)
    }
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
