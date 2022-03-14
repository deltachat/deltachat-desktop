import { C } from 'deltachat-node/dist/constants'
import React, { useContext } from 'react'
import {
  ScreenContext,
  useTranslationFunction,
  SettingsContext,
} from '../contexts'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockFirstContactOfChatDialog,
  openViewGroupDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
  sendCallInvitation,
} from './helpers/ChatMethods'
import { FullChat } from '../../shared/shared-types'
import { ContextMenuItem } from './ContextMenu'

export function DeltaMenuItem({
  text,
  onClick,
}: {
  text: string
  onClick: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
}) {
  return (
    <li onClick={onClick}>
      <a className='bp3-menu-item bp3-popover-dismiss'>
        <div className='bp3-text-overflow-ellipsis bp3-fill'>{text}</div>
      </a>
    </li>
  )
}

export function useThreeDotMenu(selectedChat: FullChat | null) {
  const screenContext = useContext(ScreenContext)
  const settingsContext = useContext(SettingsContext)
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
    const onViewGroup = () =>
      openViewGroupDialog(screenContext, selectedChat as FullChat)
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
    const onVideoChat = () => {
      const chatId = selectedChat.id
      if (!chatId) {
        return
      }
      screenContext.openDialog('ConfirmationDialog', {
        header: tx('videochat_invite_user_to_videochat', selectedChat.name),
        message: tx('videochat_invite_user_hint'),
        confirmLabel: tx('ok'),
        cb: (yes: boolean) => {
          if (yes) {
            sendCallInvitation(screenContext, chatId)
          }
        },
      })

    }

    menu = [
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
      settingsContext.desktopSettings !== null &&
        settingsContext.desktopSettings.enableAVCalls &&
        !isReadOnlyChat && {
          label: tx('videochat'),
          action: onVideoChat,
        },
      {
        label: tx('menu_delete_chat'),
        action: onDeleteChat,
      },
      isGroup &&
        selfInGroup && {
          label: tx('menu_edit_group'),
          action: onViewGroup,
        },
      {
        label: tx('menu_leave_group'),
        action: onLeaveGroup,
      },
      !isGroup &&
        !(isSelfTalk || isDeviceChat) && {
          label: tx('menu_block_contact'),
          action: onBlockContact,
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
      !isReadOnlyChat && {
        label: tx('ephemeral_messages'),
        action: onDisappearingMessages,
      },
      !(isSelfTalk || isDeviceChat) &&
        settingsContext.desktopSettings !== null  &&
        settingsContext.desktopSettings.enableChatAuditLog && {
          label: tx('menu_chat_audit_log'),
          action: openChatAuditLog,
        },
    ]
  }

  return (event: React.MouseEvent<any, MouseEvent>) => {
    let threeDotButtonElement = document.querySelector(
      '#main-menu-button'
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
