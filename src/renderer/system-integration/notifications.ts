import { T } from 'deltachat-node/deltachat-jsonrpc/typescript/src/lib'
import { appName } from '../../shared/constants'
import { getLogger } from '../../shared/logger'
import { BackendRemote } from '../backend-com'
import { isImage } from '../components/attachment/Attachment'
import { jumpToMessage } from '../components/helpers/ChatMethods'
import { runtime } from '../runtime'
import SettingsStoreInstance from '../stores/settings'

const log = getLogger('renderer/notifications')

function isMuted(accountId: number, chatId: number) {
  return BackendRemote.rpc.isChatMuted(accountId, chatId)
}

type queuedNotification = {
  chatId: number
  messageId: number
}

let queuedNotifications: {
  [accountId: number]: queuedNotification[]
} = {}

async function incomingMessageHandler(
  accountId: number,
  chatId: number,
  messageId: number
) {
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

  if (typeof queuedNotifications[accountId] === 'undefined') {
    queuedNotifications[accountId] = []
  }
  queuedNotifications[accountId].push({ chatId, messageId })
}

async function showNotification(
  accountId: number,
  chatId: number,
  messageId: number
) {
  const tx = window.static_translate

  if (!SettingsStoreInstance.state?.desktopSettings.showNotificationContent) {
    runtime.showNotification({
      title: appName,
      body: tx('notify_new_message'),
      icon: null,
      chatId,
      messageId,
      accountId,
    })
  } else {
    try {
      const notificationInfo = await BackendRemote.rpc.getMessageNotificationInfo(
        accountId,
        messageId
      )
      const { chatName, summaryPrefix, summaryText } = notificationInfo
      runtime.showNotification({
        title: chatName,
        body: summaryPrefix ? `${summaryPrefix}: ${summaryText}` : summaryText,
        icon: getNotificationIcon(notificationInfo),
        chatId,
        messageId,
        accountId,
      })
    } catch (error) {
      log.error('failed to create notification for message: ', messageId, error)
    }
  }
}

async function showGroupedNotification(
  accountId: number,
  notifications: queuedNotification[]
) {
  const tx = window.static_translate

  if (!SettingsStoreInstance.state?.desktopSettings.showNotificationContent) {
    runtime.showNotification({
      title: appName,
      body: tx('notify_new_messages'),
      icon: null,
      chatId: 0,
      messageId: 0,
      accountId,
    })
  } else {
    const chatIds = [...new Set(notifications.map(({ chatId }) => chatId))]
    const msgCount = notifications.length

    try {
      if (chatIds.length === 1) {
        // all messages are from the same chat
        // can show profile image of chat
        // title: chatName
        // body: "5 new Messages in ChatName"
        const notificationInfo = await BackendRemote.rpc.getMessageNotificationInfo(
          accountId,
          notifications[0].messageId
        )
        const { chatName, chatProfileImage } = notificationInfo
        runtime.showNotification({
          title: chatName,
          body: tx('notify_bundle_new_messages_in_one_chat', String(msgCount)),
          icon: chatProfileImage || null,
          chatId: chatIds[0],
          messageId: 0, // just select chat on click, no specific message
          accountId,
        })
      } else {
        // messages from diffent chats
        // title: "new messages"
        // body: "324 new messages in 6 chats"
        const chatCount = chatIds.length
        runtime.showNotification({
          title: tx('notify_new_messages'), // IDEA: when we support notifications from multiple accounts, then show account displayname here?
          body: tx('notify_bundle_new_messages', [
            String(msgCount),
            String(chatCount),
          ]),
          icon: null, // IDEA: when we support notifications from multiple accounts, then show account profile image here?
          chatId: 0,
          messageId: 0,
          accountId,
        })
      }
    } catch (error) {
      log.error('failed to create grouped notification: ', notifications, error)
    }
  }
}

// how many notifications can be shown without being grouped
const STARTUP_LIMIT = 1
const NORMAL_LIMIT = 3

let notificationLimit = STARTUP_LIMIT

async function flushNotifications(accountId: number) {
  if (typeof queuedNotifications[accountId] === 'undefined') {
    // make it work even if there is nothing
    queuedNotifications[accountId] = []
  }
  const notifications = [...queuedNotifications[accountId]]
  queuedNotifications = []

  if (notifications.length > notificationLimit) {
    showGroupedNotification(accountId, notifications)
  } else {
    for (const { chatId, messageId } of notifications) {
      await showNotification(accountId, chatId, messageId)
    }
  }
  notificationLimit = NORMAL_LIMIT
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
  BackendRemote.on('IncomingMsg', (accountId, { chatId, msgId }) => {
    if (accountId !== window.__selectedAccountId) {
      // notifications for different accounts are not supported yet
      return
    }
    incomingMessageHandler(accountId, chatId, msgId)
  })
  BackendRemote.on('IncomingMsgBunch', accountId => {
    flushNotifications(accountId)
  })
  runtime.setNotificationCallback(({ accountId, msgId, chatId }) => {
    if (window.__selectedAccountId !== accountId) {
      log.error('notification comes from other account')
      // TODO implement switch account
    } else {
      if (chatId !== 0) {
        clearNotificationsForChat(accountId, chatId)
        if (msgId !== 0) {
          jumpToMessage(msgId, true)
        }
      }
    }
  })
}
