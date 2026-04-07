import { platform } from 'os'
import { app, Notification, nativeImage, ipcMain } from 'electron'
import { dialog } from 'electron/main'

import * as mainWindow from './windows/main.js'
import { appIcon } from './application-constants.js'
import type { DcNotification } from '../../shared/shared-types.js'
import { getLogger } from '../../shared/logger.js'

import type { NativeImage, IpcMainInvokeEvent } from 'electron'
import { DCJsonrpcRemoteInitializedP } from './ipc.js'
import { tx } from './load-translations.js'
import { unknownErrorToString } from '@deltachat-desktop/shared/unknownErrorToString'
import { appName } from '@deltachat-desktop/shared/constants.js'

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
    hasReply:
      data.accountId !== 0 &&
      data.chatId !== 0 &&
      // Also need this condition because we don't want to have the "reply" UI
      // for generic "<chat name>: 3 new messages" notifications.
      data.messageId !== 0,
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
        // But now that we've removed the references to the notification,
        // make sure that it really is closed.
        notify.close()
      }
      // eslint-disable-next-line no-console
      console.log('Notification close event triggered', notify)
    })
    notify.on('reply', async e => {
      // See the Android's implementation:
      // https://github.com/deltachat/deltachat-android/blob/acb4eb2ae1ccc327aa7df6cf2b40da09e1b7e47b/src/main/java/org/thoughtcrime/securesms/notifications/RemoteReplyReceiver.java#L58-L71
      try {
        const jsonrpcRemote = await DCJsonrpcRemoteInitializedP

        const sendP = jsonrpcRemote.rpc.sendMsg(accountId, chatId, {
          quotedMessageId: data.messageId,
          text: e.reply,

          file: null,
          filename: null,
          html: null,
          location: null,
          overrideSenderName: null,
          quotedText: null,
          viewtype: null,
        })

        // We don't `await` these because they're not that important.
        jsonrpcRemote.rpc.markseenMsgs(accountId, [data.messageId])
        jsonrpcRemote.rpc.marknoticedChat(accountId, chatId)

        await sendP
      } catch (err) {
        // Note that we expect this error for channels and otherwise
        // read-only chats, i.e. `!chat.canSend`.
        // TODO fix: we should do the same checks as we do
        // for the "Reply" menu item, `showReply`.
        dialog.showErrorBox(
          `${appName}: ${tx('notify_reply_button')} failed`,
          tx(
            'error_x',
            'Failed to send reply from notification:\n' +
              unknownErrorToString(err)
          )
        )
      }
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

function clearNotificationsForMessage(
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

function clearNotificationsForChat(
  _: unknown,
  accountId: number,
  chatId: number
) {
  log.debug('clearNotificationsForChat', { accountId, chatId, notifications })
  if (notifications[accountId]?.[chatId]) {
    for (const messageId of Object.keys(notifications[accountId][chatId])) {
      clearNotificationsForMessage(_, accountId, chatId, Number(messageId))
    }
    delete notifications[accountId][chatId]
  }
  log.debug('after cleared Notifications', { accountId, chatId, notifications })
}

function clearAccount(_event: IpcMainInvokeEvent | null, accountId: number) {
  for (const chatId of Object.keys(notifications[Number(accountId)] || {})) {
    if (!Number.isNaN(Number(chatId))) {
      clearNotificationsForChat(null, Number(accountId), Number(chatId))
    }
  }
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
