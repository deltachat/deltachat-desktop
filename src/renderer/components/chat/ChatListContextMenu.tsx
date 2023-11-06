import React, { useContext, useState } from 'react'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockFirstContactOfChatDialog,
  openEncryptionInfoDialog,
  openViewGroupDialog,
  openViewProfileDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
} from '../helpers/ChatMethods'

import { C } from '@deltachat/jsonrpc-client'
import { ContextMenuItem } from '../ContextMenu'
import MailingListProfile from '../dialogs/MessageListProfile'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

// const log = getLogger('renderer/ChatListContextMenu')

function archiveStateMenu(
  chat: Type.ChatListItemFetchResult & { kind: 'ChatListItem' },
  tx: ReturnType<typeof useTranslationFunction>,
  isTheSelectedChat: boolean
): ContextMenuItem[] {
  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: () => setChatVisibility(chat.id, 'Archived', isTheSelectedChat),
  }
  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: () => setChatVisibility(chat.id, 'Normal', isTheSelectedChat),
  }
  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: () => setChatVisibility(chat.id, 'Pinned', chat.isArchived),
  }
  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: () => setChatVisibility(chat.id, 'Normal'),
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
    chatListItem: Type.ChatListItemFetchResult & { kind: 'ChatListItem' },
    selectedChatId: number | null
  ) => Promise<void>
  activeContextMenuChatId: number | null
} {
  const screenContext = useContext(ScreenContext)
  const accountId = selectedAccountId()
  const [activeContextMenuChatId, setActiveContextMenuChatId] = useState<
    number | null
  >(null)

  return {
    activeContextMenuChatId,
    openContextMenu: async (event, chatListItem, selectedChatId) => {
      const tx = window.static_translate
      const onDeleteChat = () =>
        openDeleteChatDialog(screenContext, chatListItem, selectedChatId)
      const onEncrInfo = () =>
        openEncryptionInfoDialog(screenContext, chatListItem)
      const onViewGroup = async () => {
        // throws error if chat was not found
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatListItem.id
        )
        openViewGroupDialog(screenContext, fullChat)
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
          openViewProfileDialog(screenContext, fullChat.contactIds[0])
        } else {
          screenContext.openDialog(MailingListProfile, {
            chat: fullChat,
          })
        }
      }
      const onLeaveGroup = () =>
        openLeaveChatDialog(screenContext, chatListItem.id)
      const onBlockContact = () =>
        openBlockFirstContactOfChatDialog(screenContext, chatListItem)
      const onMuteChat = () =>
        openMuteChatDialog(screenContext, chatListItem.id)
      const onUnmuteChat = () => unMuteChat(chatListItem.id)

      const menu: (ContextMenuItem | false)[] = chatListItem
        ? [
            // Archive & Pin
            ...archiveStateMenu(
              chatListItem,
              tx,
              selectedChatId === chatListItem.id
            ),
            // Mute
            !chatListItem.isMuted
              ? {
                  label: tx('menu_mute'),
                  action: onMuteChat,
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
              label: 'Edit Broadcast List',
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
      await screenContext.openContextMenu({
        cursorX,
        cursorY,
        items: menu,
      })
      setActiveContextMenuChatId(null)
    },
  }
}
