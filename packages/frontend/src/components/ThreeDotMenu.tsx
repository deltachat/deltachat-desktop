import { C } from '@deltachat/jsonrpc-client'
import React, { useContext } from 'react'

import { Timespans } from '../../../shared/constants'
import { ContextMenuItem } from './ContextMenu'
import { useSettingsStore } from '../stores/settings'
import { BackendRemote } from '../backend-com'
import { ActionEmitter, KeybindAction } from '../keybindings'
import useChat from '../hooks/chat/useChat'
import useChatDialog from '../hooks/chat/useChatDialog'
import useDialog from '../hooks/dialog/useDialog'
import useTranslationFunction from '../hooks/useTranslationFunction'
import DisappearingMessages from './dialogs/DisappearingMessages'
import { ContextMenuContext } from '../contexts/ContextMenuContext'
import { selectedAccountId } from '../ScreenController'
import { unmuteChat } from '../backend/chat'

import type { T } from '@deltachat/jsonrpc-client'

export function useThreeDotMenu(selectedChat?: T.FullChat) {
  const { openDialog } = useDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const [settingsStore] = useSettingsStore()
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const {
    openBlockFirstContactOfChatDialog,
    openChatAuditDialog,
    openDeleteChatsDialog,
    openLeaveGroupOrChannelDialog,
    openClearChatDialog,
  } = useChatDialog()

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
      selectedChat && openLeaveGroupOrChannelDialog(accountId, chatId, isGroup)

    const onBlockContact = () =>
      openBlockFirstContactOfChatDialog(accountId, selectedChat)

    const onDeleteChat = () =>
      openDeleteChatsDialog(accountId, [selectedChat], chatId)

    const onUnmuteChat = () => unmuteChat(accountId, chatId)

    const onChatAudit = () => openChatAuditDialog(selectedChat)

    const onClearChat = () => openClearChatDialog(accountId, chatId)

    const onDisappearingMessages = () =>
      openDialog(DisappearingMessages, {
        chatId: selectedChat.id,
      })

    menu = [
      {
        label: tx('search_in_chat'),
        action: () => {
          // Same as in with `KeybindAction.ChatList_SearchInChat`
          //
          // TODO improvement a11y: maybe we can add `aria-keyshortcuts=`
          // to this menu item?
          window.__chatlistSetSearch?.('', selectedChat.id)
          setTimeout(
            () =>
              ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput),
            0
          )
        },
      },
      canSend &&
        selectedChat.chatType !== C.DC_CHAT_TYPE_IN_BROADCAST &&
        selectedChat.chatType !== C.DC_CHAT_TYPE_MAILINGLIST && {
          label: tx('ephemeral_messages'),
          action: onDisappearingMessages,
        },
      !(isSelfTalk || isDeviceChat) &&
        settingsStore !== null &&
        settingsStore.desktopSettings.enableChatAuditLog && {
          label: tx('menu_chat_audit_log'),
          action: onChatAudit,
        },
      { type: 'separator' },
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
                label: tx('mute_for_eight_hours'),
                action: () => {
                  BackendRemote.rpc.setChatMuteDuration(
                    accountId,
                    selectedChat.id,
                    {
                      kind: 'Until',
                      duration: Timespans.ONE_HOUR_IN_SECONDS * 8,
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
            action: () => {
              BackendRemote.rpc.setChatVisibility(accountId, chatId, 'Normal')
              unselectChat()
            },
          }
        : {
            label: tx('menu_archive_chat'),
            action: () => {
              BackendRemote.rpc.setChatVisibility(accountId, chatId, 'Archived')
              unselectChat()
            },
          },
      { type: 'separator' },
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
        action: onClearChat,
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
    ) as HTMLDivElement

    const boundingBox = threeDotButtonElement.getBoundingClientRect()

    const [x, y] = [
      boundingBox.x + boundingBox.width - 3,
      boundingBox.y + boundingBox.height - 2,
    ]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      x,
      y,
      items: menu,
    })
  }
}
