import React, { useContext } from 'react'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEncryptionInfoDialog,
  openEditGroupDialog,
  openViewProfileDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
} from '../helpers/ChatMethods'

import { ChatListItemType } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { DeltaBackend } from '../../delta-remote'
import { ContextMenuItem } from '../ContextMenu'
import MessageListProfile from '../dialogs/MessageListProfile'

// const log = getLogger('renderer/ChatListContextMenu')

function archiveStateMenu(
  chat: ChatListItemType,
  tx: ReturnType<typeof useTranslationFunction>,
  isTheSelectedChat: boolean
): ContextMenuItem[] {
  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: () =>
      setChatVisibility(
        chat.id,
        C.DC_CHAT_VISIBILITY_ARCHIVED,
        isTheSelectedChat
      ),
  }
  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: () =>
      setChatVisibility(
        chat.id,
        C.DC_CHAT_VISIBILITY_NORMAL,
        isTheSelectedChat
      ),
  }
  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: () =>
      setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_PINNED, chat.archived),
  }
  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: () => setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_NORMAL),
  }

  /*
            Archive	UnArchive	Pin	UnPin
  pinned	  y	      n       	n	  y
  archived  n       y       	y	  n
  normal	  y	      n       	y	  n
  */

  if (chat.pinned) {
    return [unPin, archive]
  } else if (chat.archived) {
    return [pin, unArchive]
  } else {
    // normal
    return [pin, archive]
  }
}

export function useChatListContextMenu() {
  const screenContext = useContext(ScreenContext)
  const tx = useTranslationFunction()

  return (
    event: React.MouseEvent<any, MouseEvent>,
    chatListItem: ChatListItemType,
    selectedChatId: number
  ) => {
    const onDeleteChat = () =>
      openDeleteChatDialog(screenContext, chatListItem, selectedChatId)
    const onEncrInfo = () =>
      openEncryptionInfoDialog(screenContext, chatListItem)
    const onEditGroup = async () => {
      const fullChat = await DeltaBackend.call(
        'chatList.getFullChatById',
        chatListItem.id
      )
      openEditGroupDialog(screenContext, fullChat)
    }
    const onViewProfile = async () => {
      const fullChat = await DeltaBackend.call(
        'chatList.getFullChatById',
        chatListItem.id
      )
      if (fullChat.type !== C.DC_CHAT_TYPE_MAILINGLIST) {
        openViewProfileDialog(screenContext, fullChat.contacts[0].id)
      } else {
        screenContext.openDialog(MessageListProfile, {
          chat: fullChat,
        })
      }
    }
    const onLeaveGroup = () =>
      openLeaveChatDialog(screenContext, chatListItem.id)
    const onBlockContact = () =>
      openBlockContactDialog(screenContext, chatListItem)
    const onMuteChat = () => openMuteChatDialog(screenContext, chatListItem.id)
    const onUnmuteChat = () => unMuteChat(chatListItem.id)

    const menu: ContextMenuItem[] = chatListItem
      ? [
          // Archive & Pin
          ...archiveStateMenu(
            chatListItem,
            tx,
            selectedChatId === chatListItem.id
          ),
          // Mute
          !chatListItem.muted
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
            chatListItem.selfInGroup && {
              label: tx('menu_edit_group'),
              action: onEditGroup,
            },
          // View Profile
          !chatListItem.isGroup && {
            label: tx('menu_view_profile'),
            action: onViewProfile,
          },
          // Encryption Info
          !chatListItem.isDeviceTalk &&
            !chatListItem.isSelfTalk && {
              label: tx('encryption_info_desktop'),
              action: onEncrInfo,
            },
          // Leave group
          chatListItem.isGroup &&
            chatListItem.selfInGroup && {
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
    screenContext.openContextMenu({
      cursorX,
      cursorY,
      items: menu,
    })
  }
}
