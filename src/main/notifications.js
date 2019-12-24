const windows = require('./windows')
const { appName, appIcon } = require('../application-constants')

const {
  app,
  Notification
} = require('electron')

/**
 * @param {import('./deltachat/controller')} dc
 * @param {*} settings
 */
module.exports = function (dc, settings) {
  if (!Notification.isSupported()) return

  let notify

  async function getMsgBody (msgId) {
    const tx = app.translate
    if (!settings.showNotificationContent) return tx('notify_new_message')
    var json = await dc.callMethod(null, 'messageList.messageIdToJson', [msgId])
    var summary = json.msg.summary
    return `${summary.text1 || json.contact.displayName}: ${summary.text2}`
  }

  dc._dc.on('DC_EVENT_INCOMING_MSG', async (chatId, msgId) => {
    if (!notify && settings.notifications && windows.main.win.hidden) {
      notify = new Notification({
        title: appName(),
        body: await getMsgBody(msgId),
        icon: appIcon()
      })
      notify.show()
      notify.on('click', () => {
        dc.sendToRenderer('ClickOnNotification', { chatId, msgId })
        windows.main.show()
        app.focus()
        notify = null
      })
      notify.on('close', () => {
        notify = null
      })
    }
  })
}
