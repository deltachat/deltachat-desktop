import { C } from '@deltachat/jsonrpc-client'
import React, { useContext } from 'react'

import { Timespans } from '../../shared/constants'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockFirstContactOfChatDialog,
  setChatVisibility,
  unMuteChat,
  clearChat,
} from './helpers/ChatMethods'
import { ContextMenuItem } from './ContextMenu'
import SettingsStoreInstance, { useSettingsStore } from '../stores/settings'
import { BackendRemote, Type } from '../backend-com'
import { ActionEmitter, KeybindAction } from '../keybindings'
import useDialog from '../hooks/useDialog'
import useTranslationFunction from '../hooks/useTranslationFunction'
import DisappearingMessages from './dialogs/DisappearingMessages'
import ChatAuditLogDialog from './dialogs/ChatAuditLogDialog'
import { ContextMenuContext } from '../contexts/ContextMenuContext'
import { selectedAccountId } from '../ScreenController'

export function useThreeDotMenu(
  selectedChat: Type.FullChat | null,
  mode: 'chat' | 'gallery' = 'chat'
) {
  const { openDialog } = useDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const [settingsStore] = useSettingsStore()
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
    const accountId = selectedAccountId()
    const isGroup = selectedChat.chatType === C.DC_CHAT_TYPE_GROUP
    const onLeaveGroup = () =>
      selectedChat && openLeaveChatDialog(openDialog, selectedChat.id)
    const onBlockContact = () =>
      openBlockFirstContactOfChatDialog(openDialog, selectedChat)
    const onDeleteChat = () =>
      openDeleteChatDialog(openDialog, selectedChat, selectedChat.id)
    const onUnmuteChat = () => unMuteChat(selectedChat.id)

    const openChatAuditLog = () =>
      openDialog(ChatAuditLogDialog, { selectedChat })

    const onDisappearingMessages = () =>
      openDialog(DisappearingMessages, {
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
            subitems: [
              {
                label: tx('mute_for_one_hour'),
                action: () => {
                  BackendRemote.rpc.setChatMuteDuration(
                    accountId,
                    selectedChat.id,
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
                    selectedChat.id,
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
                    selectedChat.id,
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
                    selectedChat.id,
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
                    selectedChat.id,
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
        action: clearChat.bind(null, openDialog, chatId),
      },
      {
        label: tx('menu_delete_chat'),
        action: onDeleteChat,
      },
    ]
  }

  if (mode == 'gallery' && settingsStore?.desktopSettings) {
    const { galleryImageKeepAspectRatio } = settingsStore.desktopSettings
    menu = [
      {
        label: tx(
          galleryImageKeepAspectRatio ? 'square_grid' : 'aspect_ratio_grid'
        ),
        action: async () => {
          await SettingsStoreInstance.effect.setDesktopSetting(
            'galleryImageKeepAspectRatio',
            !galleryImageKeepAspectRatio
          )
        },
      },
    ]
  }

  return (event: React.MouseEvent<any, MouseEvent>) => {
    const threeDotButtonElement = document.querySelector(
      '#three-dot-menu-button'
    ) as HTMLDivElement

    const boundingBox = threeDotButtonElement.getBoundingClientRect()

    const [cursorX, cursorY] = [
      boundingBox.x + boundingBox.width - 3,
      boundingBox.y + boundingBox.height - 2,
    ]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      cursorX,
      cursorY,
      items: menu,
    })
  }
}
