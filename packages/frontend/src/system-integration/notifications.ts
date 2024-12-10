import { appName } from '../../../shared/constants'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../backend-com'
import { isImage } from '../components/attachment/Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import SettingsStoreInstance from '../stores/settings'
import AccountNotificationStoreInstance from '../stores/accountNotifications'

import type { T } from '@deltachat/jsonrpc-client'

const log = getLogger('renderer/notifications')

function isMuted(accountId: number, chatId: number) {
  return BackendRemote.rpc.isChatMuted(accountId, chatId)
}

type queuedNotification = {
  chatId: number
  messageId: number
  isWebxdcInfo?: boolean
}

let queuedNotifications: {
  [accountId: number]: queuedNotification[]
} = {}

function incomingMessageHandler(
  accountId: number,
  chatId: number,
  messageId: number,
  isWebxdcInfo: boolean = false
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
  queuedNotifications[accountId].push({ chatId, messageId, isWebxdcInfo })
}

async function incomingWebxdcEventHandler(
  accountId: number,
  messageId: number
) {
  const message = await BackendRemote.rpc.getMessage(accountId, messageId)
  const chatId = message.chatId
  incomingMessageHandler(accountId, chatId, messageId, true)
}

async function showNotification(
  accountId: number,
  chatId: number,
  messageId: number,
  isWebxdcInfo: boolean
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
      isWebxdcInfo,
    })
  } else {
    try {
      let chatName = ''
      let summaryPrefix = ''
      let summaryText = ''
      let notificationInfo: T.MessageNotificationInfo | undefined
      let icon: string | null = null
      if (isWebxdcInfo) {
        const relatedMessage = await BackendRemote.rpc.getMessage(
          accountId,
          messageId
        )
        if (
          relatedMessage.systemMessageType === 'WebxdcInfoMessage' &&
          relatedMessage.parentId
        ) {
          summaryText = relatedMessage.text
          const webxdcMessage = await BackendRemote.rpc.getMessage(
            accountId,
            relatedMessage.parentId
          )
          if (webxdcMessage.webxdcInfo) {
            summaryPrefix = `${webxdcMessage.webxdcInfo.name}`
            if (webxdcMessage.webxdcInfo.icon) {
              const iconName = webxdcMessage.webxdcInfo.icon
              const iconBlob = await BackendRemote.rpc.getWebxdcBlob(
                accountId,
                webxdcMessage.id,
                iconName
              )
              // needed for valid dataUrl
              const imageExtension = iconName.split('.').pop()
              icon = `data:image/${imageExtension};base64, ${iconBlob}`
            }
          }
        }
      } else {
        notificationInfo = await BackendRemote.rpc.getMessageNotificationInfo(
          accountId,
          messageId
        )
        chatName = notificationInfo.chatName
        summaryPrefix = notificationInfo.summaryPrefix ?? ''
        summaryText = notificationInfo.summaryText ?? ''
        icon = getNotificationIcon(notificationInfo)
      }
      runtime.showNotification({
        title: chatName,
        body: summaryPrefix ? `${summaryPrefix}: ${summaryText}` : summaryText,
        icon,
        chatId,
        messageId,
        accountId,
        isWebxdcInfo,
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
      isWebxdcInfo: false,
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
          isWebxdcInfo: false, // no way to handle webxdcInfo in grouped notifications
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
          isWebxdcInfo: false,
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

export function initNotifications() {
  BackendRemote.on('IncomingMsg', (accountId, { chatId, msgId }) => {
    incomingMessageHandler(accountId, chatId, msgId)
  })
  BackendRemote.on('IncomingWebxdcNotify', (accountId, { msgId }) => {
    incomingWebxdcEventHandler(accountId, msgId)
  })
  BackendRemote.on('IncomingMsgBunch', accountId => {
    flushNotifications(accountId)
  })
}
