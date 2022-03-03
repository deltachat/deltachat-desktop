import * as mainWindow from './windows/main'
import { app, Notification, NativeImage, nativeImage } from 'electron'
import { appName } from '../shared/constants'
import { appIcon } from './application-constants'
import DeltaChatController from './deltachat/controller'
import { FullChat, MessageType } from '../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { getLogger } from '../shared/logger'
import { platform } from 'os'
import { tx } from './load-translations'

const log = getLogger('main/notifications')

const isMac = platform() === 'darwin'

export default function (dc: DeltaChatController, settings: any) {
  if (!Notification.isSupported()) return

  async function isMuted(chatId: number) {
    return await dc.callMethod(null, 'chatList.isChatMuted', [chatId])
  }

  async function createNotification(
    chatId: number,
    msgId: number
  ): Promise<Notification> {
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
        MessageType | null
      ] = await Promise.all([
        dc.callMethod(null, 'chatList.getFullChatById', [chatId]),
        dc.callMethod(null, 'messageList.messageIdToJson', [msgId]),
      ])

      if (!message_json) {
        throw new Error(
          "could not create notification for a message that doesn't exist (anymore?):" +
            msgId
        )
      }

      const summary = message_json.summary

      let icon: NativeImage | undefined = undefined
      if (message_json?.viewType === C.DC_MSG_IMAGE) {
        // if is image
        icon = nativeImage.createFromPath(message_json?.file)
        // idea - maybe needs resize
        // issue/idea - does not work with all imagetypes - idea: have something reliable for thumbnail generation
      } else if (chatInfo.profileImage) {
        // if has chat an avatar picture
        icon = nativeImage.createFromPath(chatInfo.profileImage)
      }

      if (!icon || icon.isEmpty()) {
        // fallback: show app icon instead (if not on mac, because mac aready shows the app icon)
        if (!isMac) {
          icon = nativeImage.createFromPath(appIcon())
        }
      }

      const notificationOptions: Electron.NotificationConstructorOptions = {
        title: `${chatInfo.name}`,
        body: summary.text1
          ? `${summary.text1}: ${summary.text2}`
          : summary.text2,
        icon,
        timeoutType: 'default',
      }

      if (process.platform === 'win32') {
        // Workaround for disabling close button on windows. Undefined electron behaviour. Yey.
        notificationOptions.closeButtonText = undefined
      }

      return new Notification(notificationOptions)
    }
  }

  let notifications: { [key: number]: Notification[] } = {}

  function clearNotificationsForChat(chatId: number) {
    if (notifications[chatId]) {
      for (const notify of notifications[chatId]) {
        notify.close()
      }
      delete notifications[chatId]
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

  dc.on(
    'DC_EVENT_INCOMING_MSG',
    async (accountId: number, chatId: number, msgId: number) => {
      if (!mainWindow.window) {
        throw new Error('window does not exist, this should never happen')
      }
      if (
        settings.notifications &&
        (mainWindow.window.hidden || !mainWindow.window.isVisible())
      ) {
        if (accountId !== dc.selectedAccountId) {
          return
        }

        if (await isMuted(chatId)) {
          return
        }
        log.debug(
          'Creating notification for chat:',
          chatId,
          'with msgId:',
          msgId
        )
        try {
          const notify = await createNotification(chatId, msgId)
          notify.on('click', Event => {
            onClickNotification(chatId, msgId, Event)
          })
          // notify.on('close', () => {})
          addNotificationForChat(chatId, notify)
          notify.show()
        } catch (error) {
          log.warn('could not create notification:', error)
        }
      }
    }
  )

  dc.on('DESKTOP_CLEAR_NOTIFICATIONS_FOR_CHAT', chatId => {
    clearNotificationsForChat(chatId)
  })

  dc.on('DESKTOP_CLEAR_ALL_NOTIFICATIONS', _ => {
    clearAllNotifications()
  })
}
