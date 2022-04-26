import { C } from 'deltachat-node/dist/constants'
import React, { useContext } from 'react'
import { ScreenContext, useTranslationFunction } from '../contexts'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockFirstContactOfChatDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
} from './helpers/ChatMethods'
import { FullChat } from '../../shared/shared-types'
import { ContextMenuItem } from './ContextMenu'
import { useSettingsStore } from '../stores/settings'

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

export function useThreeDotMenu(selectedChat: FullChat | null) {
  const screenContext = useContext(ScreenContext)
  const settingsStore = useSettingsStore()[0]
  const tx = useTranslationFunction()

  let menu: (ContextMenuItem | false)[] = [false]
  if (selectedChat && selectedChat.id) {
    const {
      isGroup,
      selfInGroup,
      isSelfTalk,
      isDeviceChat,
      id: chatId,
    } = selectedChat
    const isReadOnlyChat = (isGroup && !selfInGroup) || isDeviceChat // setting this as var because we plan to have more readonly chats in the future
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
      !isReadOnlyChat && {
        label: tx('ephemeral_messages'),
        action: onDisappearingMessages,
      },
      !(isSelfTalk || isDeviceChat) &&
        settingsStore !== null &&
        settingsStore.desktopSettings.enableChatAuditLog && {
          label: tx('menu_chat_audit_log'),
          action: openChatAuditLog,
        },
      !selectedChat.muted
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
            action: () =>
              setChatVisibility(chatId, C.DC_CHAT_VISIBILITY_NORMAL, true),
          }
        : {
            label: tx('menu_archive_chat'),
            action: () =>
              setChatVisibility(chatId, C.DC_CHAT_VISIBILITY_ARCHIVED, true),
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
