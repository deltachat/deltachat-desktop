import * as mainWindow from './windows/main'
import { app, Notification, NativeImage, nativeImage, ipcMain } from 'electron'
import { appIcon } from './application-constants'
import { DcNotification } from '../shared/shared-types'

import { getLogger } from '../shared/logger'
import { platform } from 'os'

const log = getLogger('main/notifications')

const isMac = platform() === 'darwin'

function createNotification(data: DcNotification): Notification {
  let icon: NativeImage | undefined = data.icon
    ? nativeImage.createFromPath(data.icon)
    : undefined

  if (!icon || icon.isEmpty()) {
    // fallback: show app icon instead (if not on mac, because mac already shows the app icon)
    if (!isMac) {
      icon = nativeImage.createFromPath(appIcon())
    }
  }

  const notificationOptions: Electron.NotificationConstructorOptions = {
    title: data.title,
    body: data.body,
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
  _ev: Electron.Event
) {
  mainWindow.send('ClickOnNotification', { accountId, chatId, msgId })
  mainWindow.show()
  app.focus()
}

const notifications: { [key: number]: Notification[] } = {}

function clearNotificationsForChat(_: any, chatId: number) {
  if (notifications[chatId]) {
    for (const notify of notifications[chatId]) {
      notify.close()
    }
    delete notifications[chatId]
  }
}

function clearAll() {
  for (const chatId of Object.keys(notifications)) {
    if (isNaN(Number(chatId))) {
      clearNotificationsForChat(null, Number(chatId))
    }
  }
}

if (Notification.isSupported()) {
  ipcMain.handle('notifications.show', (_, data: DcNotification) => {
    const chatId = data.chatId

    log.debug('Creating notification:', data)

    try {
      const notify = createNotification(data)

      notify.on('click', Event => {
        onClickNotification(data.accountId, chatId, data.messageId, Event)
        notifications[chatId] = notifications[chatId].filter(n => n !== notify)
        notify.close()
      })
      notify.on('close', () => {
        notifications[chatId] = notifications[chatId].filter(n => n !== notify)
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
  })

  ipcMain.handle('notifications.clear', clearNotificationsForChat)
  ipcMain.handle('notifications.clearAll', clearAll)
  process.on('beforeExit', clearAll)
}
