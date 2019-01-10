const windows = require('./windows')
/* *CONFIG* */
const config = require('../config')
const { appIcon } = require('../application-constants')

const {
  app,
  Notification
} = require('electron')

module.exports = function (dc, settings) {
  if (!Notification.isSupported()) return

  let notify

  function getMsgBody (msgId) {
    const tx = app.translate
    if (!settings.showNotificationContent) return tx('notify_new_message')
    var json = dc.messageIdToJson(msgId)
    var summary = json.msg.summary
    return `${summary.text1 || json.contact.displayName}: ${summary.text2}`
  }

  dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
    if (!notify && settings.notifications && windows.main.win.hidden) {
      notify = new Notification({
        title: config.APP_NAME,
        body: getMsgBody(msgId),
        icon: appIcon()
      })
      notify.show()
      notify.on('click', () => {
        dc.selectChat(chatId)
        app.focus()
        notify = null
      })
      notify.on('close', () => {
        notify = null
      })
    }
  })
}
