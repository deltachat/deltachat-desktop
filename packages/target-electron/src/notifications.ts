import { platform } from 'os'
import { app, Notification, nativeImage, ipcMain } from 'electron'

import * as mainWindow from './windows/main.js'
import { appIcon } from './application-constants.js'
import type { DcNotification } from '../../shared/shared-types.js'
import { getLogger } from '../../shared/logger.js'

import type { NativeImage, IpcMainInvokeEvent } from 'electron'
import { DCJsonrpcRemoteInitializedP } from './ipc.js'

/**
 * Notification related functions to:
 * - show notifications in operating system
 * - handle click on notification
 *
 * is triggered from renderer process (!)
 * by handling events (ipcMain.handle)
 *
 * see: frontend/src/system-integration/notifications.ts
 */

const log = getLogger('main/notifications')

const isMac = platform() === 'darwin'

if (Notification.isSupported()) {
  ipcMain.handle('notifications.show', showNotification)
  ipcMain.handle('notifications.clear', clearNotificationsForChat)
  ipcMain.handle('notifications.clearAll', clearAll)
  ipcMain.handle('notifications.clearAccount', clearAccount)
  process.on('beforeExit', clearAll)
} else {
  // Register no-op handlers for notifications to silently fail when
  // no notifications are supported
  ipcMain.handle('notifications.show', () => {})
  ipcMain.handle('notifications.clear', () => {})
  ipcMain.handle('notifications.clearAll', () => {})
}

function createNotification(data: DcNotification): Notification {
  let icon: NativeImage | undefined = data.icon
    ? data.icon.startsWith('data:')
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
  _ev: Electron.Event
) {
  mainWindow.send('ClickOnNotification', {
    accountId,
    chatId,
    msgId,
  })
  mainWindow.show()
  app.focus()
  mainWindow.window?.focus()
}

/**
 * There may be multiple notifications per one message.
 * Such as with "Bob reacted to your message",
 * this is why we have `Notification[]` here.
 */
const notifications: {
  [accountId: number]: { [chatId: number]: { [msgId: number]: Notification[] } }
} = {}

/**
 * triggers creation of a notification, adds appropriate
 * callbacks and shows it via electron Notification API
 *
 * @param data is passed from renderer process
 */
function showNotification(_event: IpcMainInvokeEvent, data: DcNotification) {
  const { chatId, accountId } = data

  log.debug(
    'Creating notification:',
    Object.assign({}, data, { body: undefined, title: undefined })
  )

  try {
    const notify = createNotification(data)

    notify.on('click', Event => {
      onClickNotification(data.accountId, chatId, data.messageId, Event)
      notifications[accountId][chatId][data.messageId] =
        notifications[accountId]?.[chatId]?.[data.messageId]?.filter(
          n => n !== notify
        ) || []
      notify.close()
    })
    notify.on('close', () => {
      // on Window and Linux this can be triggered by system time out
      // when the message is moved to notification center so only close
      // the notification on this event on Mac
      if (isMac) {
        notifications[accountId][chatId][data.messageId] =
          notifications[accountId]?.[chatId]?.[data.messageId]?.filter(
            n => n !== notify
          ) || []
      }
      // eslint-disable-next-line no-console
      console.log('Notification close event triggered', notify)
    })

    if (!notifications[accountId]) {
      notifications[accountId] = {}
    }
    if (!notifications[accountId][chatId]) {
      notifications[accountId][chatId] = {}
    }

    if (notifications[accountId][chatId][data.messageId]) {
      notifications[accountId][chatId][data.messageId].push(notify)
    } else {
      notifications[accountId][chatId][data.messageId] = [notify]
    }

    notify.show()
  } catch (error) {
    log.warn('could not create notification:', error)
  }
}

function _clearNotificationsForMessage(
  _: unknown,
  accountId: number,
  chatId: number,
  messageId: number
) {
  const arr = notifications[accountId]?.[chatId]?.[messageId]
  if (arr == undefined) {
    return
  }
  arr.forEach(notify => {
    notify.close()
  })
  delete notifications[accountId][chatId][messageId]
}
function clearNotificationsForMessage(
  _: unknown,
  accountId: number,
  chatId: number,
  messageId: number
) {
  _clearNotificationsForMessage(_, accountId, chatId, messageId)

  // A message in this chat and account is noticed.
  // This means that this chat and account is noticed,
  // so also clear generic notificaions that apply to this chat and account.
  clearGenericPerChatNotifications(_, accountId, chatId)
  clearGenericPerAccountNotifications(_, accountId)
}
// Unfortunately we've come to rely on `chatId` or `messageId` of 0
// having special meaning. Namely we produce those
// for `n_messages_in_m_chats` and `chat_n_new_messages` notifications.
// Also possibly Core is firing events with `chatId` or `messageId`
// set to 0.
// So when it comes to clearing notifications, we should treat 0
// as a "wildcard" value, meaning
// "this notification might belong to any chat in this account"
// (when `chatId === 0`),
// or "any message in this chat" (when `chatId !== 0 && messageId === 0`).
// See https://github.com/deltachat/deltachat-desktop/issues/3937#issuecomment-2261541284.
/**
 * Clear notifications that have `messageId === 0`,
 * such as `chat_n_new_messages`.
 */
function clearGenericPerChatNotifications(
  _: unknown,
  accountId: number,
  chatId: number
) {
  _clearNotificationsForMessage(_, accountId, chatId, 0)
}
/**
 * Clear notifications that have `chatId === 0`,
 * such as `n_messages_in_m_chats`.
 */
function clearGenericPerAccountNotifications(_: unknown, accountId: number) {
  const chatIdZero = 0
  // Yes, this is copy-pasted from `clearNotificationsForChat`.
  // We're not using that function directly to avoid recursion.
  //
  // Also note that simply doing
  // `clearNotificationsForMessage_(_, accountId, 0, 0)`
  // would have been enough because we don't expect
  // 0-chat to have non-0 `messageId`s,
  // but let's properly loop through all keys.
  if (notifications[accountId]?.[chatIdZero]) {
    for (const messageId of Object.keys(notifications[accountId][chatIdZero])) {
      _clearNotificationsForMessage(_, accountId, chatIdZero, Number(messageId))
    }
    delete notifications[accountId][chatIdZero]
  }
}

function clearNotificationsForChat(
  _: unknown,
  accountId: number,
  chatId: number
) {
  log.debug('clearNotificationsForChat', { accountId, chatId, notifications })
  if (notifications[accountId]?.[chatId]) {
    for (const messageId of Object.keys(
      notifications[accountId]?.[chatId] || {}
    )) {
      clearNotificationsForMessage(_, accountId, chatId, Number(messageId))
    }
    delete notifications[accountId][chatId]
  }
  // No need to `clearGenericPerChatNotifications()`,
  // because we've already cleared notifications
  // for _all_ message IDs just above, including 0.

  // A chat in this account is noticed.
  // This means that this account is noticed,
  // so also clear generic notificaions that apply to this account.
  clearGenericPerAccountNotifications(_, accountId)

  log.debug('after cleared Notifications', { accountId, chatId, notifications })
}

function clearAccount(_event: IpcMainInvokeEvent | null, accountId: number) {
  for (const chatId of Object.keys(notifications[Number(accountId)] || {})) {
    if (!Number.isNaN(Number(chatId))) {
      clearNotificationsForChat(null, Number(accountId), Number(chatId))
    }
  }
  // No need to `clearGenericPerAccountNotifications()`,
  // because we've already cleared notifications
  // for _all_ chat IDs just above, including 0.
}

function clearAll() {
  for (const accountId of Object.keys(notifications || {})) {
    if (!Number.isNaN(Number(accountId))) {
      clearAccount(null, Number(accountId))
    }
  }
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

DCJsonrpcRemoteInitializedP.then(jsonrpcRemote => {
  jsonrpcRemote.on('MsgDeleted', (accountId, { chatId, msgId }) => {
    clearNotificationsForMessage(null, accountId, chatId, msgId)
  })
  jsonrpcRemote.on('MsgsNoticed', (accountId, { chatId }) => {
    clearNotificationsForChat(null, accountId, chatId)
  })
})
