import { useCallback } from 'react'

import { Props, EncryptionInfo } from '../../components/dialogs/EncryptionInfo'
import MuteChat from '../../components/dialogs/MuteChat'
import useChat from './useChat'
import useConfirmationDialog from '../dialog/useConfirmationDialog'
import useDialog from '../dialog/useDialog'
import useTranslationFunction from '../useTranslationFunction'
import { BackendRemote, EffectfulBackendActions } from '../../backend-com'

import type { T } from '@deltachat/jsonrpc-client'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('useChatDialog')

type ChatListItem = T.ChatListItemFetchResult & { kind: 'ChatListItem' }

export default function useChatDialog() {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const { openDialog } = useDialog()
  const { chatWithLinger, selectChat, unselectChat } = useChat()

  const chatContactIds = chatWithLinger?.contactIds
  const openBlockContactById = useCallback(
    async (accountId: number, dmChatContact: number) => {
      const hasUserConfirmed = await openConfirmationDialog({
        message: tx('ask_block_contact'),
        confirmLabel: tx('menu_block_contact'),
        isConfirmDanger: true,
      })

      if (hasUserConfirmed) {
        if (
          chatContactIds &&
          chatContactIds.length === 1 &&
          chatContactIds[0] === dmChatContact
        ) {
          unselectChat()
        }
        await BackendRemote.rpc.blockContact(accountId, dmChatContact)
      }
    },
    [openConfirmationDialog, tx, unselectChat, chatContactIds]
  )

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

      return openBlockContactById(accountId, dmChatContact)
    },
    [openBlockContactById]
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

  const openDeleteChatsDialog = useCallback(
    async (
      accountId: number,
      /**
       * Must be of non-0 length.
       */
      chats: Array<Pick<T.BasicChat | ChatListItem, 'id' | 'name'>>,
      selectedChatId: number | null
    ) => {
      if (chats.length === 0) {
        log.error('openDeleteChatsDialog called with 0 chats')
        return
      }

      const hasUserConfirmed = await openConfirmationDialog({
        message:
          chats.length === 1
            ? tx('ask_delete_named_chat', chats[0].name)
            : tx('ask_delete_chat', chats.length.toString(), {
                quantity: chats.length,
              }) +
              '\n\n' +
              chats.map(c => c.name).join('\n'),
        confirmLabel: tx('delete'),
        isConfirmDanger: true,
      })

      if (hasUserConfirmed) {
        await Promise.all(
          chats.map(async chat => {
            if (selectedChatId === chat.id) {
              unselectChat()
            }
            await EffectfulBackendActions.deleteChat(accountId, chat.id)
          })
        )
      }
    },
    [openConfirmationDialog, tx, unselectChat]
  )

  const openEncryptionInfoDialog = useCallback(
    (props: Props) => {
      openDialog(EncryptionInfo, props)
    },
    [openDialog]
  )

  const openLeaveGroupOrChannelDialog = useCallback(
    async (accountId: number, chatId: number, isGroup: boolean) => {
      const hasUserConfirmed = await openConfirmationDialog({
        message: tx('ask_leave_group'),
        confirmLabel: isGroup
          ? tx('menu_leave_group')
          : tx('menu_leave_channel'),
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
    openBlockContactById,
    openClearChatDialog,
    openDeleteChatsDialog,
    openEncryptionInfoDialog,
    openLeaveGroupOrChannelDialog,
    openMuteChatDialog,
  }
}
