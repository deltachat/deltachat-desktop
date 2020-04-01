import * as mainWindow from './windows/main'
import { app, Notification } from 'electron'
import { appName } from '../shared/constants'
import { appIcon } from './application-constants'
import DeltaChatController from './deltachat/controller'
import { ExtendedAppMainProcess } from './types'

export default function(dc: DeltaChatController, settings: any) {
  if (!Notification.isSupported()) return

  let notify: Notification

  async function getMsgBody(msgId: number) {
    const tx = (app as ExtendedAppMainProcess).translate
    if (!settings.showNotificationContent) return tx('notify_new_message')
    var json = await dc.callMethod(null, 'messageList.messageIdToJson', [msgId])
    var summary = json.msg.summary
    return `${summary.text1 || json.contact.displayName}: ${summary.text2}`
  }

  dc._dc.on('DC_EVENT_INCOMING_MSG', async (chatId: number, msgId: number) => {
    if (!notify && settings.notifications && mainWindow.window.hidden) {
      notify = new Notification({
        title: appName,
        body: await getMsgBody(msgId),
        icon: appIcon(),
      })
      notify.show()
      notify.on('click', () => {
        dc.sendToRenderer('ClickOnNotification', { chatId, msgId })
        mainWindow.show()
        app.focus()
        notify = null
      })
      notify.on('close', () => {
        notify = null
      })
    }
  })
}
