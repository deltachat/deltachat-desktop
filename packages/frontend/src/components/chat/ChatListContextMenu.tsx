import React, { useContext, useState } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

import { Timespans } from '../../../../shared/constants'
import { ContextMenuItem } from '../ContextMenu'
import MailingListProfile from '../dialogs/MailingListProfile'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import useChat from '../../hooks/chat/useChat'
import { CloneChat } from '../dialogs/CreateChat'
import useChatDialog from '../../hooks/chat/useChatDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useOpenViewGroupDialog from '../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import DisappearingMessages from '../dialogs/DisappearingMessages'
import type { UnselectChat } from '../../contexts/ChatContext'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { useSettingsStore } from '../../stores/settings'

const log = getLogger('ChatListContextMenu')

type ChatListItem = T.ChatListItemFetchResult & { kind: 'ChatListItem' }

/**
 * Helper to execute a function for all selected chats
 */
function createBatchAction(
  chats: ChatListItem[],
  fn: (chat: ChatListItem) => Promise<unknown>
) {
  return () => Promise.all(chats.map(chat => fn(chat)))
}

/**
 * Builds archive and pin menu items based on chat states
 */
function buildArchiveAndPinMenuItems(
  unselectChat: UnselectChat,
  accountId: number,
  chats: ChatListItem[],
  tx: ReturnType<typeof useTranslationFunction>,
  selectedChatId: number | null
): { pin: ContextMenuItem; archive: ContextMenuItem } {
  const batchAction = (fn: (chat: ChatListItem) => Promise<unknown>) =>
    () => Promise.all(chats.map(chat => fn(chat)))

  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: batchAction(async chat => {
      if (chat.id === selectedChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Archived')
    }),
  }

  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: batchAction(async chat => {
      if (chat.id === selectedChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    }),
  }

  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: batchAction(async chat => {
      if (chat.id === selectedChatId && chat.isArchived) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Pinned')
    }),
  }

  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: batchAction(chat =>
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    ),
  }

  // Determine which menu items to show based on chat states
  if (chats.every(chat => chat.isPinned)) {
    return { pin: unPin, archive }
  } else if (chats.every(chat => chat.isArchived)) {
    return { pin, archive: unArchive }
  } else {
    return { pin, archive }
  }
}

export function useChatListContextMenu(selectedChat?: T.FullChat): {
  openContextMenu: (
    event: React.MouseEvent<any, MouseEvent>,
    /**
     * Must be of non-0 length.
     */
    chatListItems: Array<T.ChatListItemFetchResult & { kind: 'ChatListItem' }>,
    selectedChatId: number | null
  ) => Promise<void>
  activeContextMenuChatIds: number[]
} {
  const { openDialog } = useDialog()
  const [settingsStore] = useSettingsStore()
  const {
    openChatAuditDialog,
    openBlockFirstContactOfChatDialog,
    openEncryptionInfoDialog,
    openDeleteChatsDialog,
    openLeaveGroupOrChannelDialog,
    openClearChatDialog,
  } = useChatDialog()
  const openViewGroupDialog = useOpenViewGroupDialog()
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const tx = useTranslationFunction()
  const [activeContextMenuChatIds, setActiveContextMenuChatIds] = useState<
    number[]
  >([])

  return {
    // TODO can we remove `activeContextMenuChatIds`? It's only used
    // to style the items, but we now have the multiselect thing.
    activeContextMenuChatIds,

    openContextMenu: async (event, chatListItems, selectedChatId) => {
      if (chatListItems.length === 0) {
        log.error('openContextMenu called with 0 chats')
        return
      }

      const onDeleteChats = () =>
        openDeleteChatsDialog(accountId, chatListItems, selectedChatId)
      const onEncrInfo = (chat: (typeof chatListItems)[number]) =>
        openEncryptionInfoDialog({
          chatId: chat.id,
          dmChatContact: chat.dmChatContact,
        })
      const onViewGroup = async (
        chatId: (typeof chatListItems)[number]['id']
      ) => {
        // throws error if chat was not found
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatId
        )
        openViewGroupDialog(
          fullChat as T.FullChat & { chatType: 'Group' | 'OutBroadcast' }
        )
      }
      const onViewProfile = async (
        chatId: (typeof chatListItems)[number]['id']
      ) => {
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatId
        )
        if (!fullChat) {
          throw new Error('chat was not found')
        }
        if (
          fullChat.chatType !== 'InBroadcast' &&
          fullChat.chatType !== 'Mailinglist'
        ) {
          openViewProfileDialog(accountId, fullChat.contactIds[0])
        } else {
          openDialog(MailingListProfile, {
            chat: fullChat as T.FullChat & {
              chatType: 'InBroadcast' | 'Mailinglist'
            },
          })
        }
      }
      const onLeaveGroupOrChannel = (chat: (typeof chatListItems)[number]) =>
        openLeaveGroupOrChannelDialog(
          accountId,
          chat.id,
          chat.chatType === 'Group'
        )
      const onBlockContact = (chat: (typeof chatListItems)[number]) =>
        openBlockFirstContactOfChatDialog(accountId, chat)

      // This is copy-pasted.
      const forAllChatsFn = (
        fn: (chat: (typeof chatListItems)[number]) => Promise<unknown>
      ) => {
        // TODO perf: maybe we need to introduce batch JSON-RPC methods,
        // instead of simply making one request per each chat?
        return () => Promise.all(chatListItems.map(chat => fn(chat)))
      }

      const { pin, archive } = archiveStateMenu(
        unselectChat,
        accountId,
        chatListItems,
        tx,
        selectedChatId
      )

      const onDisappearingMessages = () => {
        if (selectedChatId === null) {
          return
        }
        openDialog(DisappearingMessages, {
          chatId: selectedChatId,
        })
      }

      const singleChat = chatListItems.length === 1 ? chatListItems[0] : false

      const isGroup: boolean = singleChat && singleChat.chatType === 'Group'

      const isOutBroadcast: boolean =
        singleChat && singleChat.chatType === 'OutBroadcast'

      const onChatAudit = () => {
        if (selectedChat) {
          openChatAuditDialog(selectedChat)
        }
      }

      const onClearChat = () => {
        if (selectedChat) {
          openClearChatDialog(accountId, selectedChat.id)
        }
      }

      const ephemeral = selectedChat &&
        selectedChat.canSend &&
        selectedChat.chatType !== 'InBroadcast' &&
        selectedChat.chatType !== 'Mailinglist' &&
        selectedChat.isEncrypted && {
          label: tx('ephemeral_messages'),
          action: onDisappearingMessages,
        }

      // TODO pluralize strings.
      const viewCloneEncInfo = [
        // View Profile
        singleChat &&
          !isGroup && {
            label: tx('menu_view_profile'),
            action: () => onViewProfile(singleChat.id),
          },
        // View Group Profile (for non encrypted groups)
        singleChat &&
          isGroup &&
          !singleChat.isEncrypted &&
          singleChat.isSelfInGroup && !singleChat.isDeviceTalk && {
            label: tx('menu_view_profile'),
            action: () => onViewGroup(singleChat.id),
          },
        // Edit Group
        singleChat &&
          isGroup &&
          singleChat.isEncrypted &&
          singleChat.isSelfInGroup && {
            label: tx('menu_edit_group'),
            dataTestid: 'edit-group',
            action: () => onViewGroup(singleChat.id),
          },
        // Edit Channel
        singleChat &&
          isOutBroadcast && {
            label: tx('edit_channel'),
            action: () => onViewGroup(singleChat.id),
          },
        // Clone Group (note that broadcasts should not be cloned!)
        singleChat &&
          isGroup && {
            label: tx('clone_chat'),
            action: () => {
              openDialog(CloneChat, {
                setViewMode: 'createGroup',
                chatTemplateId: singleChat.id,
              })
            },
          },

        // Encryption Info
        singleChat &&
          !singleChat.isDeviceTalk &&
          !singleChat.isSelfTalk && {
            label: tx('encryption_info_title_desktop'),
            action: () => onEncrInfo(singleChat),
          },
      ]

      const menu: (ContextMenuItem | false)[] = [
        {
          label: tx('search_in_chat'),
          action: () => {
            // Same as in with `KeybindAction.ChatList_SearchInChat`
            //
            // TODO improvement a11y: maybe we can add `aria-keyshortcuts=`
            // to this menu item?
            window.__chatlistSetSearch?.('', selectedChatId)
            setTimeout(
              () =>
                ActionEmitter.emitAction(
                  KeybindAction.ChatList_FocusSearchInput
                ),
              0
            )
          },
        },
        { type: 'separator' },
        // Pin
        pin,
        // Mute
        chatListItems.some(item => !item.isMuted)
          ? {
              label: tx('menu_mute'),
              subitems: [
                ...[
                  {
                    label: tx('mute_for_one_hour'),
                    duration: Timespans.ONE_HOUR_IN_SECONDS,
                  },
                  {
                    label: tx('mute_for_eight_hours'),
                    duration: Timespans.ONE_HOUR_IN_SECONDS * 8,
                  },
                  {
                    label: tx('mute_for_one_day'),
                    duration: Timespans.ONE_DAY_IN_SECONDS,
                  },
                  {
                    label: tx('mute_for_seven_days'),
                    duration: Timespans.ONE_WEEK_IN_SECONDS,
                  },
                ].map(({ label, duration }) => ({
                  label,
                  action: forAllChatsFn(chat =>
                    BackendRemote.rpc.setChatMuteDuration(accountId, chat.id, {
                      kind: 'Until',
                      duration,
                    })
                  ),
                })),
                {
                  label: tx('mute_forever'),
                  action: forAllChatsFn(chat =>
                    BackendRemote.rpc.setChatMuteDuration(accountId, chat.id, {
                      kind: 'Forever',
                    })
                  ),
                },
              ],
            }
          : {
              label: tx('menu_unmute'),
              action: forAllChatsFn(chat =>
                BackendRemote.rpc.setChatMuteDuration(accountId, chat.id, {
                  kind: 'NotMuted',
                })
              ),
            },
        // Archive
        archive,
        { type: 'separator' },
        // TODO support leaving multiple channels
        // and blocking multiple contacts.
        //
        // Leave channel
        singleChat &&
          singleChat.chatType === 'InBroadcast' &&
          !singleChat.isContactRequest && {
            label: tx('menu_leave_channel'),
            action: () => onLeaveGroupOrChannel(singleChat),
          },
        // Leave group
        singleChat &&
          isGroup &&
          singleChat.isEncrypted &&
          singleChat.isSelfInGroup &&
          !singleChat.isContactRequest && {
            label: tx('menu_leave_group'),
            action: () => onLeaveGroupOrChannel(singleChat),
          },
        // Block contact
        singleChat &&
          !isGroup &&
          !(
            singleChat.isSelfTalk ||
            singleChat.isDeviceTalk ||
            isOutBroadcast
          ) && {
            label: tx('menu_block_contact'),
            action: () => onBlockContact(singleChat),
          },
        selectedChat && {
          label: tx('clear_chat'),
          action: onClearChat,
        },
        // Delete
        {
          label: tx('menu_delete_chat'),
          action: onDeleteChats,
        },
        {
          label: tx('menu_more_options'),
          subitems: [
            ...(viewCloneEncInfo.some(item => Boolean(item))
              ? ([{ type: 'separator' }] as const)
              : []),
            ...viewCloneEncInfo,
            ephemeral,
            !(selectedChat?.isSelfTalk || selectedChat?.isDeviceChat) &&
              settingsStore !== null &&
              settingsStore.desktopSettings.enableChatAuditLog &&
              selectedChat && {
                label: tx('menu_chat_audit_log'),
                action: onChatAudit,
              },
          ].filter(Boolean) as ContextMenuItem[],
        },
      ].filter(Boolean) as ContextMenuItem[]

      event.preventDefault() // prevent default runtime context menu from opening

      setActiveContextMenuChatIds(chatListItems.map(item => item.id))
      await openContextMenu({
        ...mouseEventToPosition(event),
        items: menu,
        ariaAttrs: {
          'aria-label': tx('chat_list_item_menu_label'),
        },
      })
      setActiveContextMenuChatIds([])
    },
  }
}
