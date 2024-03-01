import { platform } from 'os'
import { app, Notification, nativeImage, ipcMain } from 'electron'

import * as mainWindow from './windows/main'
import { appIcon } from './application-constants'
import { DcNotification } from '../shared/shared-types'
import { getLogger } from '../shared/logger'

import type { NativeImage, IpcMainInvokeEvent } from 'electron'
import type { NotifyConfig } from '@deltachat/node-dbus-notifier'

const log = getLogger('main/notifications')

function onClickNotification(accountId: number, chatId: number, msgId: number) {
  mainWindow.send('ClickOnNotification', { accountId, chatId, msgId })
  mainWindow.show()
  app.focus()
}

if (process.platform === 'linux') {
  ;(async () => {
    const { Notify } = await import('@deltachat/node-dbus-notifier')
    const notifications: { [key: number]: (typeof Notify.prototype)[] } = {}

    function createNotification(data: DcNotification): typeof Notify.prototype {
      let maybeIcon: Partial<NotifyConfig['hints']> = {}

      if (data.icon) {
        try {
          const image = nativeImage.createFromPath(data.icon)
          const { width, height } = image.getSize()
          const bitmap = image.toBitmap()

          maybeIcon.imageData = {
            data: Uint8ClampedArray.from(bitmap),
            hasAlpha: bitmap.byteLength > 3 * width * height,
            width,
            height,
          }
        } catch (error) {
          log.error('notification load image fail', data)
        }
      }

      return new Notify({
        appName: 'Delta Chat',
        appIcon: 'chat.delta.desktop',
        summary: data.title,
        body: data.body, // TODO escape html
        timeout: 0, // do not expire notifications
        hints: {
          category: 'im.received',
          ...maybeIcon,
          // "suppressSound" - later if we play our own sound in https://github.com/deltachat/deltachat-desktop/pull/3583
        },
      })
    }

    function showNotification(_ev: IpcMainInvokeEvent, data: DcNotification) {
      const chatId = data.chatId
      log.debug('Creating notification:', data)
      try {
        const notify = createNotification(data)

        notify.on('close', () => {
          notifications[chatId] =
            notifications[chatId]?.filter(n => n !== notify) || []
        })

        if (notifications[chatId]) {
          notifications[chatId].push(notify)
        } else {
          notifications[chatId] = [notify]
        }

        notify.show().then(() => {
          onClickNotification(data.accountId, chatId, data.messageId)
          notifications[chatId] =
            notifications[chatId]?.filter(n => n !== notify) || []
          notify.close()
        })
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

    ipcMain.handle('notifications.show', showNotification)
    ipcMain.handle('notifications.clear', clearNotificationsForChat)
    ipcMain.handle('notifications.clearAll', clearAll)

    Notify.supportedCapabilities().then(capabilities => {
      log.debug('supported notification Capabilities:', capabilities)
    })
  })()
} else if (Notification.isSupported()) {
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

  const notifications: { [key: number]: Notification[] } = {}

  function showNotification(_event: IpcMainInvokeEvent, data: DcNotification) {
    const chatId = data.chatId

    log.debug('Creating notification:', data)

    try {
      const notify = createNotification(data)

      notify.on('click', _ev => {
        onClickNotification(data.accountId, chatId, data.messageId)
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
