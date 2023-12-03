import { T } from '@deltachat/jsonrpc-client'
import { appName } from '../../shared/constants'
import { getLogger } from '../../shared/logger'
import { BackendRemote } from '../backend-com'
import { isImage } from '../components/attachment/Attachment'
import { jumpToMessage } from '../components/helpers/ChatMethods'
import { runtime } from '../runtime'
import { selectedAccountId } from '../ScreenController'
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

function incomingMessageHandler(
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

  if (typeof queuedNotifications[accountId] === 'undefined') {
    queuedNotifications[accountId] = []
  }
  queuedNotifications[accountId].push({ chatId, messageId })
}

const TEST_NOTIFICATION_CHAT_ID = -5 // core will never return negative values

export async function showTestNotification() {
  showNotification(selectedAccountId(), TEST_NOTIFICATION_CHAT_ID, 0)
}

async function showNotification(
  accountId: number,
  chatId: number,
  messageId: number
) {
  const tx = window.static_translate

  const { playSystemSound } = playSound()

  if (!SettingsStoreInstance.state?.desktopSettings.showNotificationContent) {
    runtime.showNotification({
      title: appName,
      body: tx('notify_new_message'),
      icon: null,
      chatId,
      messageId,
      accountId,
      playSystemSound,
    })
  } else {
    try {
      let notificationInfo: T.MessageNotificationInfo
      if (chatId === TEST_NOTIFICATION_CHAT_ID) {
        notificationInfo = {
          accountId: accountId,
          chatId: TEST_NOTIFICATION_CHAT_ID,
          chatName: 'Chat Name (Test Notification)',
          chatProfileImage: null,
          id: 0,
          image: null,
          imageMimeType: null,
          summaryPrefix: null,
          summaryText: 'This is a test message',
        }
      } else {
        notificationInfo = await BackendRemote.rpc.getMessageNotificationInfo(
          accountId,
          messageId
        )
      }
      const { chatName, summaryPrefix, summaryText } = notificationInfo
      runtime.showNotification({
        title: chatName,
        body: summaryPrefix ? `${summaryPrefix}: ${summaryText}` : summaryText,
        icon: getNotificationIcon(notificationInfo),
        chatId,
        messageId,
        accountId,
        playSystemSound,
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

  const { playSystemSound } = playSound()

  if (!SettingsStoreInstance.state?.desktopSettings.showNotificationContent) {
    runtime.showNotification({
      title: appName,
      body: tx('new_messages'),
      icon: null,
      chatId: 0,
      messageId: 0,
      accountId,
      playSystemSound,
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
          body: tx('chat_n_new_messages', String(msgCount), {
            quantity: msgCount,
          }),
          icon: chatProfileImage || null,
          chatId: chatIds[0],
          messageId: 0, // just select chat on click, no specific message
          accountId,
          playSystemSound,
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
          playSystemSound,
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

function playSound(): { playSystemSound: boolean } {
  const tone =
    SettingsStoreInstance.state?.desktopSettings.notificationTonePath ||
    'system'
  if (tone !== 'silent') {
    const audio_src = runtime.resolveNotificationSound(tone)
    if (audio_src) {
      const audio = new Audio(audio_src)
      audio.play()
    }
  }
  return { playSystemSound: tone === 'system' }
}
