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

// const log = getLogger('renderer/ChatListContextMenu')

function archiveStateMenu(
  chat: ChatListItemType,
  tx: ReturnType<typeof useTranslationFunction>
): ContextMenuItem[] {
  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: () =>
      setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_ARCHIVED, true),
  }
  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: () => setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_NORMAL, true),
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
      openViewProfileDialog(screenContext, fullChat.contacts[0].id)
    }
    const onLeaveGroup = () =>
      openLeaveChatDialog(screenContext, chatListItem.id)
    const onBlockContact = () =>
      openBlockContactDialog(screenContext, chatListItem)
    const onMuteChat = () => openMuteChatDialog(screenContext, chatListItem.id)
    const onUnmuteChat = () => unMuteChat(chatListItem.id)

    const menu: ContextMenuItem[] = chatListItem
      ? [
          ...archiveStateMenu(chatListItem, tx),
          {
            label: tx('menu_delete_chat'),
            action: onDeleteChat,
          },
          !chatListItem.isGroup &&
            !chatListItem.isDeviceTalk && {
              label: tx('encryption_info_desktop'),
              action: onEncrInfo,
            },
          chatListItem.isGroup &&
            chatListItem.selfInGroup && {
              label: tx('menu_edit_group'),
              action: onEditGroup,
            },
          chatListItem.isGroup &&
            chatListItem.selfInGroup && {
              label: tx('menu_leave_group'),
              action: onLeaveGroup,
            },
          !chatListItem.isGroup && {
            label: tx('menu_view_profile'),
            action: onViewProfile,
          },
          !chatListItem.isGroup &&
            !(chatListItem.isSelfTalk || chatListItem.isDeviceTalk) && {
              label: tx('menu_block_contact'),
              action: onBlockContact,
            },
          !chatListItem.muted
            ? {
                label: tx('menu_mute'),
                action: onMuteChat,
              }
            : {
                label: tx('menu_unmute'),
                action: onUnmuteChat,
              },
        ]
      : []

    const [cursorX, cursorY] = [event.clientX, event.clientY]
    screenContext.openContextMenu({
      cursorX,
      cursorY,
      items: menu,
    })
  }
}
