import * as mainWindow from './windows/main'
import { app, Notification, NativeImage, nativeImage } from 'electron'
import { appName } from '../shared/constants'
import { appIcon } from './application-constants'
import DeltaChatController from './deltachat/controller'
import { ExtendedAppMainProcess } from './types'
import { FullChat, MessageType } from '../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'

export default function (dc: DeltaChatController, settings: any) {
  if (!Notification.isSupported()) return

  async function isMuted(chatId: number) {
    return await dc.callMethod(null, 'chatList.isChatMuted', [chatId])
  }

  async function createNotification(
    chatId: number,
    msgId: number
  ): Promise<Notification> {
    const tx = (app as ExtendedAppMainProcess).translate

    if (!settings.showNotificationContent) {
      // Notification which does not show content
      return new Notification({
        title: appName,
        body: tx('notify_new_message'),
        icon: appIcon(),
      })
    } else {
      const [chatInfo, message_json]: [
        FullChat,
        { msg: null } | MessageType
      ] = await Promise.all([
        dc.callMethod(null, 'chatList.getFullChatById', [chatId]),
        dc.callMethod(null, 'messageList.messageIdToJson', [msgId]),
      ])

      const summary = message_json.msg.summary

      let icon: NativeImage
      if (message_json.msg?.viewType === C.DC_MSG_IMAGE) {
        // if is image
        icon = nativeImage.createFromPath(message_json.msg.file)
        // idea - maybe needs resize
        // issue/idea - does not work with all imagetypes - idea: have something reliable for thumbnail generation
      } else if (chatInfo.profileImage) {
        // if has chat an avatar picture
        icon = nativeImage.createFromPath(chatInfo.profileImage)
      }

      if (!icon || icon.isEmpty()) {
        // fallback: show app icon instead
        icon = nativeImage.createFromPath(appIcon())
      }

      return new Notification({
        title: `${chatInfo.name} | ${appName}`,
        body: summary.text1
          ? `${summary.text1}: ${summary.text2}`
          : summary.text2,
        icon,
      })
    }
  }

  let notifications: { [key: number]: Notification[] } = {}

  function clearNotificationsForChat(chatId: number) {
    if (notifications[chatId]) {
      for (const notify of notifications[chatId]) {
        notify.close()
      }
      notifications[chatId] = null
    }
  }

  function clearAllNotifications() {
    for (const chatId of Object.keys(notifications)) {
      if (isNaN(Number(chatId))) {
        clearNotificationsForChat(Number(chatId))
      }
    }
    notifications = {}
  }

  function addNotificationForChat(chatId: number, notify: Notification) {
    if (notifications[chatId]) {
      notifications[chatId].push(notify)
    } else {
      notifications[chatId] = [notify]
    }
  }

  function onClickNotification(
    chatId: number,
    msgId: number,
    _ev: Electron.Event
  ) {
    dc.sendToRenderer('ClickOnNotification', { chatId, msgId })
    clearNotificationsForChat(chatId)
    mainWindow.show()
    app.focus()
  }

  dc._dc.on('DC_EVENT_INCOMING_MSG', async (chatId: number, msgId: number) => {
    if (
      settings.notifications &&
      (mainWindow.window.hidden || !mainWindow.window.isVisible())
    ) {
      if (await isMuted(chatId)) {
        return
      }
      const notify = await createNotification(chatId, msgId)
      notify.on('click', onClickNotification.bind(null, chatId, msgId))
      // notify.on('close', () => {})
      addNotificationForChat(chatId, notify)
      notify.show()
    }
  })

  dc.on('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', (_ev, chatId) => {
    clearNotificationsForChat(chatId)
  })

  dc.on('DESKTOP_CLEAR_ALL_NOTIFICATIONS', _ev => {
    clearAllNotifications()
  })
}
