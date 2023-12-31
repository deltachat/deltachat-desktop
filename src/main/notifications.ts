import { platform } from 'os'
import { app, Notification, nativeImage, ipcMain } from 'electron'

import * as mainWindow from './windows/main'
import { appIcon } from './application-constants'
import { DcNotification } from '../shared/shared-types'
import { getLogger } from '../shared/logger'

import type { NativeImage, IpcMainInvokeEvent } from 'electron'

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

function showNotification(_event: IpcMainInvokeEvent, data: DcNotification) {
  const chatId = data.chatId

  log.debug('Creating notification:', data)

  try {
    const notify = createNotification(data)

    notify.on('click', Event => {
      onClickNotification(data.accountId, chatId, data.messageId, Event)
      notifications[chatId] =
        notifications[chatId]?.filter(n => n !== notify) || []
      notify.close()
    })
    notify.on('close', () => {
      notifications[chatId] =
        notifications[chatId]?.filter(n => n !== notify) || []
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
