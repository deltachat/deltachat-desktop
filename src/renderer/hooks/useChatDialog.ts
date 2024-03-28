import { useCallback } from 'react'

import ChatAuditLogDialog from '../components/dialogs/ChatAuditLogDialog'
import EncryptionInfo from '../components/dialogs/EncryptionInfo'
import MuteChat from '../components/dialogs/MuteChat'
import useChat from './useChat'
import useConfirmationDialog from './useConfirmationDialog'
import useDialog from './useDialog'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote, EffectfulBackendActions } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'

type ChatListItem = T.ChatListItemFetchResult & { kind: 'ChatListItem' }

export default function useChatDialog() {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const { openDialog } = useDialog()
  const { selectChat, unselectChat } = useChat()

  /**
   * Block contacts based on a DM chat/chatlistentry with that contact.
   */
  const openBlockFirstContactOfChatDialog = useCallback(
    async (accountId: number, chat: T.FullChat | ChatListItem) => {
      const dmChatContact =
        (chat as ChatListItem).dmChatContact ||
        (chat as T.FullChat).contactIds[0]

      if (!dmChatContact) {
        return
      }

      const hasUserConfirmed = await openConfirmationDialog({
        message: tx('ask_block_contact'),
        confirmLabel: tx('menu_block_contact'),
        isConfirmDanger: true,
      })

      if (hasUserConfirmed) {
        await EffectfulBackendActions.blockContact(accountId, dmChatContact)
        unselectChat()
      }
    },
    [openConfirmationDialog, tx, unselectChat]
  )

  const openChatAuditDialog = useCallback(
    (selectedChat: T.FullChat) => {
      openDialog(ChatAuditLogDialog, { selectedChat })
    },
    [openDialog]
  )

  const openClearChatDialog = useCallback(
    async (accountId: number, chatId: number) => {
      const messagesToDelete = await BackendRemote.rpc.getMessageIds(
        accountId,
        chatId,
        false,
        false
      )

      const hasUserConfirmed = await openConfirmationDialog({
        message: tx('ask_delete_messages', String(messagesToDelete.length), {
          quantity: messagesToDelete.length,
        }),
      })

      if (hasUserConfirmed) {
        // @TODO: Check this:
        // Workaround event race where it tried to load already deleted
        // messages by unloading the chat first.
        unselectChat()
        await BackendRemote.rpc.deleteMessages(accountId, messagesToDelete)
        selectChat(accountId, chatId)
      }
    },
    [openConfirmationDialog, selectChat, tx, unselectChat]
  )

  const openDeleteChatDialog = useCallback(
    async (
      accountId: number,
      chat: T.FullChat | ChatListItem,
      selectedChatId: number | null
    ) => {
      const hasUserConfirmed = await openConfirmationDialog({
        message: tx('ask_delete_named_chat', chat.name),
        confirmLabel: tx('delete'),
        isConfirmDanger: true,
      })

      if (hasUserConfirmed && chat.id) {
        await EffectfulBackendActions.deleteChat(accountId, chat.id)
        if (selectedChatId === chat.id) {
          unselectChat()
        }
      }
    },
    [openConfirmationDialog, tx, unselectChat]
  )

  const openEncryptionInfoDialog = useCallback(
    (chatListItem: ChatListItem) => {
      openDialog(EncryptionInfo, { chatListItem })
    },
    [openDialog]
  )

  const openLeaveChatDialog = useCallback(
    async (accountId: number, chatId: number) => {
      const hasUserConfirmed = await openConfirmationDialog({
        message: tx('ask_leave_group'),
        confirmLabel: tx('menu_leave_group'),
        isConfirmDanger: true,
        noMargin: true,
      })

      if (hasUserConfirmed) {
        BackendRemote.rpc.leaveGroup(accountId, chatId)
      }
    },
    [openConfirmationDialog, tx]
  )

  const openMuteChatDialog = useCallback(
    (chatId: number) => {
      openDialog(MuteChat, { chatId })
    },
    [openDialog]
  )

  return {
    openBlockFirstContactOfChatDialog,
    openChatAuditDialog,
    openClearChatDialog,
    openDeleteChatDialog,
    openEncryptionInfoDialog,
    openLeaveChatDialog,
    openMuteChatDialog,
  }
}
