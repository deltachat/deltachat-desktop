const windows = require('./windows')
const config = require('../config')

const {
  app,
  Notification
} = require('electron')

module.exports = function (dc, settings) {
  let notify

  function getMsgBody (msgId) {
    const tx = app.translate
    if (!settings.showNotificationContent) return tx('newMessageNotification')
    var json = dc.messageIdToJson(msgId)
    var summary = json.msg.summary
    return `${summary.text1 || json.contact.displayName}: ${summary.text2}`
  }

  if (Notification.isSupported()) {
    dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
      if (!notify && settings.notifications && windows.main.win.hidden) {
        notify = new Notification({
          title: config.APP_NAME,
          body: getMsgBody(msgId),
          icon: config.APP_ICON
        })
        notify.show()
        notify.on('click', () => {
          dc.selectChat(chatId)
          app.focus()
          notify.close()
        })
        notify.on('close', () => {
          notify = null
        })
      }
    })
  }
}
