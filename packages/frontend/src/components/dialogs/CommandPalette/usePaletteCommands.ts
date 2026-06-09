import { useMemo } from 'react'

import { BackendRemote } from '../../../backend-com'
import { useRpcFetch } from '../../../hooks/useFetch'
import useDialog from '../../../hooks/dialog/useDialog'
import useChat from '../../../hooks/chat/useChat'
import useChatDialog from '../../../hooks/chat/useChatDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import CreateChat from '../CreateChat'
import QrCode from '../QrCode'
import { SCAN_CONTEXT_TYPE } from '../../../hooks/useProcessQr'

import type { PaletteItem } from './types'
import Settings from '../../Settings'

export type UsePaletteCommandsParams = {
  accountId: number
  /** The chat in the breadcrumb, if any — enables chat-specific commands. */
  scopedChat: { id: number; name: string } | null
  /** The chat currently open in the main view, so delete can unselect it. */
  selectedChatId: number | null
  /** Dismisses the palette after a command runs. */
  close: () => void
}

/**
 * Builds the command-mode items,
 * some of them depending on the scope context
 */
export function usePaletteCommands({
  accountId,
  scopedChat,
  selectedChatId,
  close,
}: UsePaletteCommandsParams): PaletteItem[] {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { unselectChat } = useChat()
  const { openDeleteChatsDialog, openMuteChatDialog } = useChatDialog()

  // Fetch the scoped chat to show the appropriate commands
  // `useRpcFetch` compares its args by reference.
  const chatIdToFetch = scopedChat?.id
  const entries = useMemo(
    () => (chatIdToFetch != null ? [chatIdToFetch] : null),
    [chatIdToFetch]
  )
  const chatItemFetch = useRpcFetch(
    BackendRemote.rpc.getChatlistItemsByEntries,
    entries != null ? [accountId, entries] : null
  )
  const chatItemResult = chatItemFetch?.lingeringResult
  const chatEntry =
    scopedChat && chatItemResult?.ok
      ? chatItemResult.value[scopedChat.id]
      : undefined
  const chatItem =
    chatEntry && chatEntry.kind === 'ChatListItem' ? chatEntry : undefined

  return useMemo(() => {
    const commands: PaletteItem[] = []

    if (chatItem) {
      // --- Mute / Unmute ---
      if (chatItem.isMuted) {
        commands.push({
          id: 'cmd-unmute',
          section: 'commands',
          icon: 'bell',
          label: tx('menu_unmute'),
          run: async () => {
            await BackendRemote.rpc.setChatMuteDuration(
              accountId,
              chatItem.id,
              {
                kind: 'NotMuted',
              }
            )
            close()
          },
        })
      } else {
        commands.push({
          id: 'cmd-mute',
          section: 'commands',
          icon: 'bell',
          label: tx('menu_mute'),
          run: () => {
            openMuteChatDialog(chatItem.id)
            close()
          },
        })
      }

      // --- Archive / Unarchive ---
      commands.push({
        id: 'cmd-archive',
        section: 'commands',
        icon: 'archive',
        label: chatItem.isArchived
          ? tx('menu_unarchive_chat')
          : tx('menu_archive_chat'),
        run: async () => {
          // unselect chat to avoid main view showing a now-archived chat.
          if (!chatItem.isArchived && chatItem.id === selectedChatId) {
            unselectChat()
          }
          await BackendRemote.rpc.setChatVisibility(
            accountId,
            chatItem.id,
            chatItem.isArchived ? 'Normal' : 'Archived'
          )
          close()
        },
      })

      // --- Delete ---
      commands.push({
        id: 'cmd-delete',
        section: 'commands',
        icon: 'trash',
        label: tx('menu_delete_chat'),
        run: () => {
          openDeleteChatsDialog(accountId, [chatItem], selectedChatId)
          close()
        },
      })
    }

    // items similar to createChat dialog's first (new...) entries
    commands.push(
      {
        id: 'cmd-new-contact',
        section: 'commands',
        icon: 'qr',
        label: tx('menu_new_contact'),
        run: async () => {
          const [qrCode, qrCodeSVG] =
            await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
          openDialog(QrCode, {
            qrCode,
            qrCodeSVG,
            selectScan: true,
            scanContext: SCAN_CONTEXT_TYPE.DEFAULT,
          })
          close()
        },
      },
      {
        id: 'cmd-new-group',
        section: 'commands',
        icon: 'forum',
        label: tx('menu_new_group'),
        run: () => {
          openDialog(CreateChat, { initialAction: 'new-group' })
          close()
        },
      },
      {
        id: 'cmd-new-channel',
        section: 'commands',
        icon: 'chat_bubble',
        label: tx('new_channel'),
        run: () => {
          openDialog(CreateChat, { initialAction: 'new-channel' })
          close()
        },
      },
      {
        id: 'cmd-settings',
        section: 'commands',
        icon: 'settings',
        label: tx('menu_settings'),
        run: () => {
          openDialog(Settings, { initialAction: 'open-settings' })
          close()
        },
      }
    )

    return commands
  }, [
    accountId,
    chatItem,
    selectedChatId,
    tx,
    openDialog,
    unselectChat,
    openDeleteChatsDialog,
    openMuteChatDialog,
    close,
  ])
}
