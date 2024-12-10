import { platform } from 'os'
import { app, Notification, nativeImage, ipcMain } from 'electron'

import * as mainWindow from './windows/main.js'
import { appIcon } from './application-constants.js'
import { DcNotification } from '../../shared/shared-types.js'
import { getLogger } from '../../shared/logger.js'

import type { NativeImage, IpcMainInvokeEvent } from 'electron'

const log = getLogger('main/notifications')

const isMac = platform() === 'darwin'

function createNotification(data: DcNotification): Notification {
  let icon: NativeImage | undefined = data.icon
    ? data.icon.indexOf('base64') > -1
      ? nativeImage.createFromDataURL(data.icon)
      : nativeImage.createFromPath(data.icon)
    : undefined

  if (!icon || icon.isEmpty()) {
    // fallback: show app icon instead (if not on mac, because mac already shows the app icon)
    if (!isMac) {
      icon = nativeImage.createFromPath(appIcon())
    }
  }

  const notificationOptions: Electron.NotificationConstructorOptions = {
    title: data.title,
    // https://www.electronjs.org/docs/latest/tutorial/notifications#linux
    // says
    // > Notifications are sent using libnotify, which can show notifications
    // > on any desktop environment that follows
    // > [Desktop Notifications Specification](https://web.archive.org/web/20240428012536/https://specifications.freedesktop.org/notification-spec/notification-spec-latest.html)
    // Which says that the body supports limited markup
    // So let's escape it.
    body:
      platform() === 'linux' ? filterNotificationText(data.body) : data.body,
    icon,
    timeoutType: 'default',
  }

  if (process.platform === 'win32') {
    // Workaround for disabling close button on windows. Undefined electron behaviour. Yey.
    notificationOptions.closeButtonText = undefined
  }

  return new Notification(notificationOptions)
}

function onClickNotification(
  accountId: number,
  chatId: number,
  msgId: number,
  isWebxdcInfo: boolean,
  _ev: Electron.Event
) {
  mainWindow.send('ClickOnNotification', {
    accountId,
    chatId,
    msgId,
    isWebxdcInfo,
  })
  mainWindow.show()
  app.focus()
  mainWindow.window?.focus()
}

const notifications: { [chatId: number]: Notification[] } = {}

function showNotification(_event: IpcMainInvokeEvent, data: DcNotification) {
  const chatId = data.chatId

  log.debug(
    'Creating notification:',
    Object.assign({}, data, { body: undefined, title: undefined })
  )

  try {
    const notify = createNotification(data)

    notify.on('click', Event => {
      onClickNotification(
        data.accountId,
        chatId,
        data.messageId,
        data.isWebxdcInfo,
        Event
      )
      notifications[chatId] =
        notifications[chatId]?.filter(n => n !== notify) || []
      notify.close()
    })
    notify.on('close', () => {
      // on Window and Linux this can be triggered by system time out
      // when the message is moved to notification center so only close
      // the notification on this event on Mac
      if (isMac) {
        notifications[chatId] =
          notifications[chatId]?.filter(n => n !== notify) || []
      }
      /* ignore-console-log */
      console.log('Notification close event triggered', notify)
    })

    if (notifications[chatId]) {
      notifications[chatId].push(notify)
    } else {
      notifications[chatId] = [notify]
    }

    notify.show()
  } catch (error) {
    log.warn('could not create notification:', error)
  }
}

function clearNotificationsForChat(_: any, chatId: number) {
  log.debug('clearNotificationsForChat', { chatId, notifications })
  if (notifications[chatId]) {
    for (const notify of notifications[chatId]) {
      notify.close()
    }
    delete notifications[chatId]
  }
  log.debug('after cleared Notifications', { chatId, notifications })
}

function clearAll() {
  for (const chatId of Object.keys(notifications)) {
    if (isNaN(Number(chatId))) {
      clearNotificationsForChat(null, Number(chatId))
    }
  }
}

if (Notification.isSupported()) {
  ipcMain.handle('notifications.show', showNotification)
  ipcMain.handle('notifications.clear', clearNotificationsForChat)
  ipcMain.handle('notifications.clearAll', clearAll)
  process.on('beforeExit', clearAll)
} else {
  // Register no-op handlers for notifications to silently fail when
  // no notifications are supported
  ipcMain.handle('notifications.show', () => {})
  ipcMain.handle('notifications.clear', () => {})
  ipcMain.handle('notifications.clearAll', () => {})
}

// Thanks to Signal for this function
// https://github.com/signalapp/Signal-Desktop/blob/ae9181a4b26264ce553c7d8379a3ee5a07de018b/ts/services/notifications.ts#L485
// it is licensed AGPL-3.0-only
function filterNotificationText(text: string) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
