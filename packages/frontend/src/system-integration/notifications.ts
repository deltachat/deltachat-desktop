import { appName } from '../../../shared/constants'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../backend-com'
import { isImage } from '../components/attachment/Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import SettingsStoreInstance from '../stores/settings'
import AccountNotificationStoreInstance from '../stores/accountNotifications'

import type { T } from '@deltachat/jsonrpc-client'

const log = getLogger('renderer/notifications')

/**
 * Notification handling:
 *
 * - listens for incoming notifications
 * - reflects notification settings
 * - prepares notification data (DcNotification)
 * - queues notifications if needed to avoid "mass" notifications
 * - sends notifications to runtime (which invokes ipcBackend)
 */

export function initNotifications() {
  BackendRemote.on('IncomingMsg', (accountId, { chatId, msgId }) => {
    incomingMessageHandler(accountId, chatId, msgId)
  })
  BackendRemote.on('IncomingWebxdcNotify', (accountId, { msgId, text }) => {
    incomingWebxdcEventHandler(accountId, msgId, text)
  })
  BackendRemote.on('IncomingMsgBunch', accountId => {
    flushNotifications(accountId)
  })
}

function isMuted(accountId: number, chatId: number) {
  return BackendRemote.rpc.isChatMuted(accountId, chatId)
}

type queuedNotification = {
  chatId: number
  messageId: number
  isWebxdcInfo: boolean
  eventText?: string
}

let queuedNotifications: {
  [accountId: number]: queuedNotification[]
} = {}

function incomingMessageHandler(
  accountId: number,
  chatId: number,
  messageId: number,
  isWebxdcInfo: boolean = false,
  eventText?: string
) {
  log.debug('incomingMessageHandler: ', { chatId, messageId })

  if (
    SettingsStoreInstance.state &&
    !SettingsStoreInstance.state.desktopSettings.notifications
  ) {
    // notifications are turned off for whole app
    log.debug(
      'notification ignored: notifications are turned off for whole app'
    )
    return
  }

  if (AccountNotificationStoreInstance.isAccountMuted(accountId)) {
    // notifications are turned off for account
    log.debug('notification ignored: notifications are turned off for account')
    return
  }

  if (document.hasFocus() && accountId === window.__selectedAccountId) {
    // window has focus don't send notification for the selected account
    log.debug(
      'notification ignored: window has focus and account of the notification is selected'
    )
    return
  }

  if (typeof queuedNotifications[accountId] === 'undefined') {
    queuedNotifications[accountId] = []
  }
  queuedNotifications[accountId].push({
    chatId,
    messageId,
    isWebxdcInfo,
    eventText,
  })
}

async function incomingWebxdcEventHandler(
  accountId: number,
  messageId: number,
  eventText: string
) {
  const message = await BackendRemote.rpc.getMessage(accountId, messageId)
  const chatId = message.chatId
  incomingMessageHandler(accountId, chatId, messageId, true, eventText)
}

async function showNotification(
  accountId: number,
  chatId: number,
  messageId: number,
  isWebxdcInfo: boolean,
  eventText?: string
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
      const notificationInfo =
        await BackendRemote.rpc.getMessageNotificationInfo(accountId, messageId)
      let summaryPrefix = notificationInfo.summaryPrefix
      const summaryText = eventText ?? notificationInfo.summaryText
      const chatName = notificationInfo.chatName
      let icon = getNotificationIcon(notificationInfo)
      if (isWebxdcInfo) {
        /**
         * messageId may refer to a webxdc message OR a wexdc-info-message!
         *
         * a notification might be sent even when no webxdc-info-message was
         * added to the chat; in that case the msg_id refers to the webxdc instance
         */
        let message = await BackendRemote.rpc.getMessage(accountId, messageId)
        if (
          message.systemMessageType === 'WebxdcInfoMessage' &&
          message.parentId
        ) {
          // we have to get the parent message
          // (the webxdc message which holds the webxdcInfo)
          message = await BackendRemote.rpc.getMessage(
            accountId,
            message.parentId
          )
        }
        if (message.webxdcInfo) {
          summaryPrefix = `${message.webxdcInfo.name}`
          if (message.webxdcInfo.icon) {
            const iconName = message.webxdcInfo.icon
            const iconBlob = await BackendRemote.rpc.getWebxdcBlob(
              accountId,
              message.id,
              iconName
            )
            // needed for valid dataUrl
            const imageExtension = iconName.split('.').pop()
            icon = `data:image/${imageExtension};base64,${iconBlob}`
          }
        } else {
          throw new Error(`no webxdcInfo in message with id ${message.id}`)
        }
      }
      runtime.showNotification({
        title: chatName,
        body: summaryPrefix ? `${summaryPrefix}: ${summaryText}` : summaryText,
        icon,
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
      body: tx('new_messages'),
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
        const notificationInfo =
          await BackendRemote.rpc.getMessageNotificationInfo(
            accountId,
            notifications[0].messageId
          )
        const { chatName, chatProfileImage } = notificationInfo
        runtime.showNotification({
          title: chatName,
          body: tx('chat_n_new_messages', String(msgCount), {
            quantity: msgCount,
          }),
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
          title: tx('new_messages'), // IDEA: when we support notifications from multiple accounts, then show account displayname here?
          body: tx('n_messages_in_m_chats', [
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
  let notifications = [...queuedNotifications[accountId]]
  queuedNotifications = []

  // filter out muted chats:
  const uniqueChats = [...new Set(notifications.map(n => n.chatId))]
  const mutedChats = (
    await Promise.all(
      uniqueChats.map(id =>
        isMuted(accountId, id).then(muted => ({ muted, id }))
      )
    )
  )
    .filter(e => e.muted)
    .map(e => e.id)
  if (mutedChats.length > 0) {
    // some chats are muted
    log.debug(`ignoring notifications of ${mutedChats.length} muted chats`)
  }
  notifications = notifications.filter(notification => {
    if (mutedChats.includes(notification.chatId)) {
      // muted chat
      log.debug('notification ignored: chat muted', notification)
      return false
    } else {
      return true
    }
  })

  if (notifications.length > notificationLimit) {
    showGroupedNotification(accountId, notifications)
  } else {
    for (const { chatId, messageId, isWebxdcInfo } of notifications) {
      await showNotification(
        accountId,
        chatId,
        messageId,
        isWebxdcInfo ?? false
      )
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
