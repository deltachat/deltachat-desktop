import { C } from '@deltachat/jsonrpc-client'
import React, { useContext } from 'react'
import { ScreenContext, useTranslationFunction } from '../contexts'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockFirstContactOfChatDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
  clearChat,
} from './helpers/ChatMethods'
import { ContextMenuItem } from './ContextMenu'
import { useSettingsStore } from '../stores/settings'
import { Type } from '../backend-com'
import { ActionEmitter, KeybindAction } from '../keybindings'

export function DeltaMenuItem({
  text,
  onClick,
}: {
  text: string
  onClick: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
}) {
  return (
    <li onClick={onClick}>
      <a className='bp4-menu-item bp4-popover-dismiss'>
        <div className='bp4-text-overflow-ellipsis bp4-fill'>{text}</div>
      </a>
    </li>
  )
}

export function useThreeDotMenu(selectedChat: Type.FullChat | null) {
  const screenContext = useContext(ScreenContext)
  const settingsStore = useSettingsStore()[0]
  const tx = useTranslationFunction()

  let menu: (ContextMenuItem | false)[] = [false]
  if (selectedChat && selectedChat.id) {
    const {
      selfInGroup,
      isSelfTalk,
      isDeviceChat,
      id: chatId,
      canSend,
    } = selectedChat
    const isGroup = selectedChat.chatType === C.DC_CHAT_TYPE_GROUP
    const onLeaveGroup = () =>
      selectedChat && openLeaveChatDialog(screenContext, selectedChat.id)
    const onBlockContact = () =>
      openBlockFirstContactOfChatDialog(screenContext, selectedChat)
    const onDeleteChat = () =>
      openDeleteChatDialog(screenContext, selectedChat, selectedChat.id)
    const onMuteChat = () => openMuteChatDialog(screenContext, selectedChat.id)
    const onUnmuteChat = () => unMuteChat(selectedChat.id)
    const openChatAuditLog = () =>
      screenContext.openDialog('ChatAuditLogDialog', { selectedChat })

    const onDisappearingMessages = () =>
      screenContext.openDialog('DisappearingMessages', {
        chatId: selectedChat.id,
      })

    menu = [
      {
        label: tx('search_in_chat'),
        action: () => {
          window.__chatlistSetSearch?.('', selectedChat.id)
          setTimeout(
            () =>
              ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput),
            0
          )
        },
      },
      canSend &&
        selectedChat.chatType !== C.DC_CHAT_TYPE_MAILINGLIST && {
          label: tx('ephemeral_messages'),
          action: onDisappearingMessages,
        },
      !(isSelfTalk || isDeviceChat) &&
        settingsStore !== null &&
        settingsStore.desktopSettings.enableChatAuditLog && {
          label: tx('menu_chat_audit_log'),
          action: openChatAuditLog,
        },
      !selectedChat.isMuted
        ? {
            label: tx('menu_mute'),
            action: onMuteChat,
          }
        : {
            label: tx('menu_unmute'),
            action: onUnmuteChat,
          },
      selectedChat.archived
        ? {
            label: tx('menu_unarchive_chat'),
            action: () => setChatVisibility(chatId, 'Normal', true),
          }
        : {
            label: tx('menu_archive_chat'),
            action: () => setChatVisibility(chatId, 'Archived', true),
          },
      !isGroup &&
        !(isSelfTalk || isDeviceChat) && {
          label: tx('menu_block_contact'),
          action: onBlockContact,
        },
      isGroup &&
        selfInGroup && {
          label: tx('menu_leave_group'),
          action: onLeaveGroup,
        },
      {
        label: tx('clear_chat'),
        action: clearChat.bind(null, chatId),
      },
      {
        label: tx('menu_delete_chat'),
        action: onDeleteChat,
      },
    ]
  }

  return (event: React.MouseEvent<any, MouseEvent>) => {
    const threeDotButtonElement = document.querySelector(
      '#three-dot-menu-button'
    ) as any

    const [cursorX, cursorY] = [
      threeDotButtonElement.offsetLeft + threeDotButtonElement.clientWidth - 5,
      threeDotButtonElement.offsetTop + threeDotButtonElement.clientHeight,
    ]
    event.preventDefault() // prevent default runtime context menu from opening

    screenContext.openContextMenu({
      cursorX,
      cursorY,
      items: menu,
    })
  }
}
