import React, { useContext, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { Timespans } from '../../../../shared/constants'
import { ContextMenuItem } from '../ContextMenu'
import MailingListProfile from '../dialogs/MessageListProfile'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { unmuteChat } from '../../backend/chat'
import useChat from '../../hooks/chat/useChat'
import useChatDialog from '../../hooks/chat/useChatDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useOpenViewGroupDialog from '../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { T } from '@deltachat/jsonrpc-client'
import type { UnselectChat } from '../../contexts/ChatContext'

function archiveStateMenu(
  unselectChat: UnselectChat,
  accountId: number,
  chat: T.ChatListItemFetchResult & { kind: 'ChatListItem' },
  tx: ReturnType<typeof useTranslationFunction>,
  isTheSelectedChat: boolean
): ContextMenuItem[] {
  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: () => {
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Archived')
      if (isTheSelectedChat) {
        unselectChat()
      }
    },
  }
  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: () => {
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
      if (isTheSelectedChat) {
        unselectChat()
      }
    },
  }
  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: () => {
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Pinned')

      if (chat.isArchived) {
        unselectChat()
      }
    },
  }
  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: () =>
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal'),
  }

  /*
            Archive	UnArchive	Pin	UnPin
  pinned	  y	      n       	n	  y
  archived  n       y       	y	  n
  normal	  y	      n       	y	  n
  */

  if (chat.isPinned) {
    return [unPin, archive]
  } else if (chat.isArchived) {
    return [pin, unArchive]
  } else {
    // normal
    return [pin, archive]
  }
}

export function useChatListContextMenu(): {
  openContextMenu: (
    event: React.MouseEvent<any, MouseEvent>,
    chatListItem: T.ChatListItemFetchResult & { kind: 'ChatListItem' },
    selectedChatId: number | null
  ) => Promise<void>
  activeContextMenuChatId: number | null
} {
  const { openDialog } = useDialog()
  const {
    openBlockFirstContactOfChatDialog,
    openEncryptionInfoDialog,
    openDeleteChatDialog,
    openLeaveChatDialog,
  } = useChatDialog()
  const openViewGroupDialog = useOpenViewGroupDialog()
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const tx = useTranslationFunction()
  const [activeContextMenuChatId, setActiveContextMenuChatId] = useState<
    number | null
  >(null)

  return {
    activeContextMenuChatId,
    openContextMenu: async (event, chatListItem, selectedChatId) => {
      const onDeleteChat = () =>
        openDeleteChatDialog(accountId, chatListItem, selectedChatId)
      const onEncrInfo = () => openEncryptionInfoDialog(chatListItem)
      const onViewGroup = async () => {
        // throws error if chat was not found
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatListItem.id
        )
        openViewGroupDialog(fullChat)
      }
      const onViewProfile = async () => {
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatListItem.id
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
      const onLeaveGroup = () => openLeaveChatDialog(accountId, chatListItem.id)
      const onBlockContact = () =>
        openBlockFirstContactOfChatDialog(accountId, chatListItem)
      const onUnmuteChat = () => unmuteChat(accountId, chatListItem.id)

      const menu: (ContextMenuItem | false)[] = chatListItem
        ? [
            // Archive & Pin
            ...archiveStateMenu(
              unselectChat,
              accountId,
              chatListItem,
              tx,
              selectedChatId === chatListItem.id
            ),
            // Mute
            !chatListItem.isMuted
              ? {
                  label: tx('menu_mute'),
                  subitems: [
                    {
                      label: tx('mute_for_one_hour'),
                      action: () => {
                        BackendRemote.rpc.setChatMuteDuration(
                          accountId,
                          chatListItem.id,
                          {
                            kind: 'Until',
                            duration: Timespans.ONE_HOUR_IN_SECONDS,
                          }
                        )
                      },
                    },
                    {
                      label: tx('mute_for_two_hours'),
                      action: () => {
                        BackendRemote.rpc.setChatMuteDuration(
                          accountId,
                          chatListItem.id,
                          {
                            kind: 'Until',
                            duration: Timespans.ONE_HOUR_IN_SECONDS * 2,
                          }
                        )
                      },
                    },
                    {
                      label: tx('mute_for_one_day'),
                      action: () => {
                        BackendRemote.rpc.setChatMuteDuration(
                          accountId,
                          chatListItem.id,
                          {
                            kind: 'Until',
                            duration: Timespans.ONE_DAY_IN_SECONDS,
                          }
                        )
                      },
                    },
                    {
                      label: tx('mute_for_seven_days'),
                      action: () => {
                        BackendRemote.rpc.setChatMuteDuration(
                          accountId,
                          chatListItem.id,
                          {
                            kind: 'Until',
                            duration: Timespans.ONE_WEEK_IN_SECONDS,
                          }
                        )
                      },
                    },
                    {
                      label: tx('mute_forever'),
                      action: () => {
                        BackendRemote.rpc.setChatMuteDuration(
                          accountId,
                          chatListItem.id,
                          { kind: 'Forever' }
                        )
                      },
                    },
                  ],
                }
              : {
                  label: tx('menu_unmute'),
                  action: onUnmuteChat,
                },
            // Edit Group
            chatListItem.isGroup &&
              chatListItem.isSelfInGroup && {
                label: tx('menu_edit_group'),
                action: onViewGroup,
              },
            // Edit Broadcast List
            chatListItem.isBroadcast && {
              label: tx('menu_edit_broadcast_list'),
              action: onViewGroup,
            },
            // View Profile
            !chatListItem.isGroup && {
              label: tx('menu_view_profile'),
              action: onViewProfile,
            },
            // Encryption Info
            !chatListItem.isDeviceTalk &&
              !chatListItem.isSelfTalk && {
                label: tx('encryption_info_title_desktop'),
                action: onEncrInfo,
              },
            // Leave group
            chatListItem.isGroup &&
              chatListItem.isSelfInGroup && {
                label: tx('menu_leave_group'),
                action: onLeaveGroup,
              },
            // Block contact
            !chatListItem.isGroup &&
              !(chatListItem.isSelfTalk || chatListItem.isDeviceTalk) && {
                label: tx('menu_block_contact'),
                action: onBlockContact,
              },
            // Delete
            {
              label: tx('menu_delete_chat'),
              action: onDeleteChat,
            },
          ]
        : []

      const [cursorX, cursorY] = [event.clientX, event.clientY]
      event.preventDefault() // prevent default runtime context menu from opening

      setActiveContextMenuChatId(chatListItem.id)
      await openContextMenu({
        cursorX,
        cursorY,
        items: menu,
      })
      setActiveContextMenuChatId(null)
    },
  }
}
