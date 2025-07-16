import React, { useContext, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { Timespans } from '../../../../shared/constants'
import { ContextMenuItem } from '../ContextMenu'
import MailingListProfile from '../dialogs/MessageListProfile'
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

import type { T } from '@deltachat/jsonrpc-client'
import type { UnselectChat } from '../../contexts/ChatContext'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('ChatListContextMenu')

function archiveStateMenu(
  unselectChat: UnselectChat,
  accountId: number,
  chats: Array<T.ChatListItemFetchResult & { kind: 'ChatListItem' }>,
  tx: ReturnType<typeof useTranslationFunction>,
  selectedChatId: number | null
): { pin: ContextMenuItem; archive: ContextMenuItem } {
  // This is copy-pasted.
  const forAllChatsFn = (
    fn: (chat: (typeof chats)[number]) => Promise<unknown>
  ) => {
    // TODO perf: maybe we need to introduce batch JSON-RPC methods,
    // instead of simply making one request per each chat?
    return () => Promise.all(chats.map(chat => fn(chat)))
  }

  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: forAllChatsFn(async chat => {
      if (chat.id === selectedChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Archived')
    }),
  }
  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: forAllChatsFn(async chat => {
      if (chat.id === selectedChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    }),
  }
  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: forAllChatsFn(async chat => {
      if (chat.id === selectedChatId && chat.isArchived) {
        unselectChat()
      }

      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Pinned')
    }),
  }
  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: forAllChatsFn(chat =>
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    ),
  }

  /*
            Archive	UnArchive	Pin	UnPin
  pinned	  y	      n       	n	  y
  archived  n       y       	y	  n
  normal	  y	      n       	y	  n
  */

  if (chats.every(chat => chat.isPinned)) {
    return { pin: unPin, archive }
  } else if (chats.every(chat => chat.isArchived)) {
    return { pin, archive: unArchive }
  } else {
    // normal
    return { pin, archive }
  }
}

export function useChatListContextMenu(): {
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
  const {
    openBlockFirstContactOfChatDialog,
    openEncryptionInfoDialog,
    openDeleteChatsDialog,
    openLeaveChatDialog,
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

      // TODO looks like pluralized strings would be nice?
      const singleChat = chatListItems.length === 1 ? chatListItems[0] : false

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
        openViewGroupDialog(fullChat)
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
        if (fullChat.chatType !== C.DC_CHAT_TYPE_MAILINGLIST) {
          openViewProfileDialog(accountId, fullChat.contactIds[0])
        } else {
          openDialog(MailingListProfile, {
            chat: fullChat,
          })
        }
      }
      const onLeaveGroup = (chatId: (typeof chatListItems)[number]['id']) =>
        openLeaveChatDialog(accountId, chatId)
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

      // TODO feat: add support for leaving multiple groups,
      // blocking multiple contacts.
      const leaveGroupOrBlockContact = [
        // Leave group
        singleChat &&
          singleChat.isGroup &&
          singleChat.isSelfInGroup && {
            label: tx('menu_leave_group'),
            action: () => onLeaveGroup(singleChat.id),
          },
        // Block contact
        singleChat &&
          !singleChat.isGroup &&
          !(singleChat.isSelfTalk || singleChat.isDeviceTalk) && {
            label: tx('menu_block_contact'),
            action: () => onBlockContact(singleChat),
          },
      ]

      const menu: (ContextMenuItem | false)[] = [
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
        // View Profile
        singleChat &&
          !singleChat.isGroup && {
            label: tx('menu_view_profile'),
            action: () => onViewProfile(singleChat.id),
          },
        // Edit Group
        singleChat &&
          singleChat.isGroup &&
          singleChat.isSelfInGroup && {
            label: tx('menu_edit_group'),
            dataTestid: 'edit-group',
            action: () => onViewGroup(singleChat.id),
          },
        // Edit Broadcast List
        singleChat &&
          singleChat.isBroadcast && {
            label: tx('edit_broadcast_list'),
            action: () => onViewGroup(singleChat.id),
          },
        // Clone Group
        singleChat &&
          singleChat.isGroup && {
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

        ...(leaveGroupOrBlockContact.some(item => item)
          ? ([{ type: 'separator' }] as const)
          : []),
        ...leaveGroupOrBlockContact,

        // Delete
        {
          label: tx('menu_delete_chat'),
          action: onDeleteChats,
        },
      ]

      event.preventDefault() // prevent default runtime context menu from opening

      setActiveContextMenuChatIds(chatListItems.map(item => item.id))
      await openContextMenu({
        ...mouseEventToPosition(event),
        items: menu,
      })
      setActiveContextMenuChatIds([])
    },
  }
}
