import { useCallback } from 'react'

import AlertDialog from '../components/dialogs/AlertDialog'
import useDialog from './dialog/useDialog'
import useMessage from './chat/useMessage'
import useOpenLinkSafely from './useOpenLinkSafely'
import { BackendRemote } from '../backend-com'
import { getLogger } from '../../../shared/logger'

const log = getLogger('hooks/useCall')

export default function useVideoChat() {
  const openLinkSafely = useOpenLinkSafely()
  const { jumpToMessage } = useMessage()
  const { openDialog } = useDialog()

  const joinVideoChat = useCallback(
    async (accountId: number, messageId: number) => {
      try {
        const message = await BackendRemote.rpc.getMessage(accountId, messageId)

        if (!message) {
          throw new Error('Message not found')
        }

        if (message.viewType !== 'VideochatInvitation') {
          throw new Error('Message is not a video chat invitation')
        }

        if (!message.videochatUrl) {
          throw new Error('Message has no video chat url')
        }

        openLinkSafely(accountId, message.videochatUrl)
      } catch (error: todo) {
        log.error('failed to join call', error)
        openDialog(AlertDialog, { message: error.toString() })
      }
    },
    [openLinkSafely, openDialog]
  )

  const sendVideoChatInvitation = useCallback(
    async (accountId: number, chatId: number) => {
      try {
        const messageId = await BackendRemote.rpc.sendVideochatInvitation(
          accountId,
          chatId
        )
        jumpToMessage({
          accountId,
          msgId: messageId,
          msgChatId: chatId,
          highlight: false,
          focus: false,
        })
        await joinVideoChat(accountId, messageId)
      } catch (error: todo) {
        log.error('failed send call invitation', error)
        openDialog(AlertDialog, {
          message: error?.message || error.toString(),
        })
      }
    },
    [joinVideoChat, jumpToMessage, openDialog]
  )

  return {
    joinVideoChat,
    sendVideoChatInvitation,
  }
}
