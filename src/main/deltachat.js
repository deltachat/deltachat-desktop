const path = require('path')
const DeltaChat = require('deltachat-node')

const config = require('../config')
const log = require('./log')
const windows = require('./windows')

module.exports = {
  init
}

function init (credentials) {
  const dc = new DeltaChat({
    addr: credentials.email,
    mail_pw: credentials.password,
    cwd: path.join(config.CONFIG_PATH, 'db') // where to store?
  })
  dc.open()

  dc.on('ready', function () {
    windows.main.dispatch('loadChats')
  })

  dc.on('ALL', (event, data1, data2) => {
    log(event, data1, data2)
  })

  dc.on('DC_EVENT_MSGS_CHANGES', (chatId, msgId) => {
    const msg = dc.getMessage(msgId)
    if (msg === null) return

    if (msg.getState().isPending()) {
      windows.main.dispatch('appendMessage', chatId, msgId)
    } else if (msg.isDeadDrop()) {
      windows.main.dispatch('queueDeadDropMessage', msg)
    }
  })

  dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
    windows.main.dispatch('appendMessage', chatId, msgId)
  })

  dc.on('DC_EVENT_WARNING', function (warning) {
    windows.main.warning(warning)
  })

  dc.on('DC_EVENT_ERROR', (code, error) => {
    windows.main.error(`${error} (code = ${code})`)
  })
}
