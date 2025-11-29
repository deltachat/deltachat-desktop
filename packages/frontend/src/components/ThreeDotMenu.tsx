import React, { useContext } from 'react'

import { Timespans } from '../../../shared/constants'
import { ContextMenuItem } from './ContextMenu'
import { BackendRemote } from '../backend-com'
import { ActionEmitter, KeybindAction } from '../keybindings'
import useChat from '../hooks/chat/useChat'
import useChatDialog from '../hooks/chat/useChatDialog'
import useDialog from '../hooks/dialog/useDialog'
import useTranslationFunction, {
  useTranslationWritingDirection,
} from '../hooks/useTranslationFunction'
import DisappearingMessages from './dialogs/DisappearingMessages'
import { ContextMenuContext } from '../contexts/ContextMenuContext'
import { selectedAccountId } from '../ScreenController'
import { unmuteChat } from '../backend/chat'

import type { T } from '@deltachat/jsonrpc-client'

export function useThreeDotMenu(selectedChat?: T.FullChat) {
  const { openDialog } = useDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const writingDirection = useTranslationWritingDirection()
  const {
    openBlockFirstContactOfChatDialog,
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
    const isGroup = selectedChat.chatType === 'Group'

    const onLeaveGroup = () =>
      selectedChat && openLeaveGroupOrChannelDialog(accountId, chatId, isGroup)

    const onBlockContact = () =>
      openBlockFirstContactOfChatDialog(accountId, selectedChat)

    const onDeleteChat = () =>
      openDeleteChatsDialog(accountId, [selectedChat], chatId)

    const onUnmuteChat = () => unmuteChat(accountId, chatId)

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
      // See https://github.com/deltachat/deltachat-android/blob/fd4a377752cc6778f161590fde2f9ab29c5d3011/src/main/java/org/thoughtcrime/securesms/ConversationActivity.java#L445-L447.
      canSend &&
        selectedChat.chatType !== 'InBroadcast' &&
        selectedChat.chatType !== 'Mailinglist' &&
        selectedChat.isEncrypted && {
          label: tx('ephemeral_messages'),
          action: onDisappearingMessages,
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
        selfInGroup &&
        !selectedChat.isContactRequest && {
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
      writingDirection === 'rtl' ? 0 : boundingBox.x + boundingBox.width - 3,
      boundingBox.y + boundingBox.height - 2,
    ]
    event.preventDefault() // prevent default runtime context menu from opening

    openContextMenu({
      x,
      y,
      items: menu,
      ariaAttrs: { 'aria-labelledby': 'three-dot-menu-button' },
    })
  }
}
