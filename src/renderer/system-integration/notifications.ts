import { T } from 'deltachat-node/deltachat-jsonrpc/typescript/src/lib'
import { appName } from '../../shared/constants'
import { getLogger } from '../../shared/logger'
import { DcNotification } from '../../shared/shared-types'
import { BackendRemote } from '../backend-com'
import { isImage } from '../components/attachment/Attachment'
import { jumpToMessage } from '../components/helpers/ChatMethods'
import { ipcBackend } from '../ipc'
import { runtime } from '../runtime'
import { selectedAccountId } from '../ScreenController'
import SettingsStoreInstance from '../stores/settings'

const log = getLogger('renderer/notifications')

function isMuted(accountId: number, chatId: number) {
  return BackendRemote.rpc.isChatMuted(accountId, chatId)
}

async function incomingMessageHandler(chatId: number, messageId: number) {
  // TODO check for account once we listen for the real event here
  const accountId = selectedAccountId()

  log.debug('incomingMessageHandler: ', { chatId, messageId })

  if (
    SettingsStoreInstance.state &&
    !SettingsStoreInstance.state.desktopSettings.notifications
  ) {
    // notifications are turned off
    log.debug('notification ignored: notifications are turned off')
    return
  }

  if (document.hasFocus()) {
    // window has focus don't send notification
    log.debug('notification ignored: window has focus')
    return
  }

  if (await isMuted(accountId, chatId)) {
    // chat is muted
    log.debug('notification ignored: chat muted')
    return
  }

  const tx = window.static_translate

  let notification: DcNotification
  if (!SettingsStoreInstance.state?.desktopSettings.showNotificationContent) {
    notification = {
      title: appName,
      body: tx('notify_new_message'),
      icon: null,
      chatId,
      messageId,
      accountId,
    }
  } else {
    try {
      const notificationInfo = await BackendRemote.rpc.messageGetNotificationInfo(
        accountId,
        messageId
      )
      const { chatName, summaryPrefix, summaryText } = notificationInfo

      notification = {
        title: chatName,
        body: summaryPrefix ? `${summaryPrefix}: ${summaryText}` : summaryText,
        icon: getNotificationIcon(notificationInfo),
        chatId,
        messageId,
        accountId,
      }

      runtime.showNotification(notification)
    } catch (error) {
      log.error('failed to create notification for message: ', messageId, error)
    }
  }
}

export function clearNotificationsForChat(accountId: number, chatId: number) {
  log.debug('clearNotificationsForChat', accountId, chatId)
  // ask runtime to delete the notifications
  runtime.clearNotifications(chatId)
}

export function clearAllNotifications() {
  // ask runtime to delete the notifications
  runtime.clearAllNotifications()
}

function getNotificationIcon(
  notification: T.MessageNotificationInfo
): string | null {
  if (notification.image && isImage(notification.imageMimeType)) {
    return notification.image
  } else if (notification.chatProfileImage) {
    return notification.chatProfileImage
  } else {
    return null
  }
}

export function initNotifications() {
  ipcBackend.on('DC_EVENT_INCOMING_MSG', async (_, [chatId, messageId]) => {
    incomingMessageHandler(chatId, messageId)
  })
  runtime.setNotificationCallback(({ accountId, msgId, chatId }) => {
    if (window.__selectedAccountId !== accountId) {
      log.error('notification comes from other account')
      // TODO implement switch account
    } else {
      clearNotificationsForChat(accountId, chatId)
      jumpToMessage(msgId, true)
    }
  })
}
