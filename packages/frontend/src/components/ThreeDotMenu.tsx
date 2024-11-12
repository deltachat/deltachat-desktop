import { C } from '@deltachat/jsonrpc-client'
import React, { useContext, useState, useEffect } from 'react'
import debounce from 'debounce'

import { Timespans } from '../../../shared/constants'
import { ContextMenuItem } from './ContextMenu'
import SettingsStoreInstance, { useSettingsStore } from '../stores/settings'
import { BackendRemote, onDCEvent } from '../backend-com'
import { ActionEmitter, KeybindAction } from '../keybindings'
import useChat from '../hooks/chat/useChat'
import useChatDialog from '../hooks/chat/useChatDialog'
import useDialog from '../hooks/dialog/useDialog'
import useTranslationFunction from '../hooks/useTranslationFunction'
import useConfirmationDialog from '../hooks/dialog/useConfirmationDialog'
import DisappearingMessages from './dialogs/DisappearingMessages'
import { ContextMenuContext } from '../contexts/ContextMenuContext'
import { selectedAccountId } from '../ScreenController'
import { unmuteChat } from '../backend/chat'

import type { T } from '@deltachat/jsonrpc-client'

import { getLogger } from '../../../shared/logger'
const log = getLogger('renderer/threedotmenu')

export function useThreeDotMenu(
  selectedChat?: T.FullChat,
  mode: 'chat' | 'gallery' = 'chat'
) {
  const { openDialog } = useDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const [settingsStore] = useSettingsStore()
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const {
    openBlockFirstContactOfChatDialog,
    openChatAuditDialog,
    openDeleteChatDialog,
    openLeaveChatDialog,
    openClearChatDialog,
  } = useChatDialog()
  const openConfirmationDialog = useConfirmationDialog()

  let menu: (ContextMenuItem | false)[] = [false]
  const [isBlocked, setBlocked] = useState(false)
  useEffect(() => {
    if (!selectedChat?.id) {
      return
    }

    const contactId = selectedChat.contactIds[0]
    const updateBlocked = async (contactId: number) => {
      try {
        setBlocked(
          (await BackendRemote.rpc.getContact(accountId, contactId)).isBlocked
        )
      } catch (err) {
        log.error(err)
      }
    }
    return onDCEvent(
      accountId,
      'ContactsChanged',
      debounce(async ({ contactId: eventContactId }) => {
        if (eventContactId == contactId) {
          updateBlocked(eventContactId)
        }
      }, 500)
    )
  }, [accountId, selectedChat])

  if (selectedChat && selectedChat.id) {
    const {
      selfInGroup,
      isSelfTalk,
      isDeviceChat,
      id: chatId,
      canSend,
    } = selectedChat
    const isGroup = selectedChat.chatType === C.DC_CHAT_TYPE_GROUP

    const contactId = selectedChat.contactIds[0]

    const onLeaveGroup = () =>
      selectedChat && openLeaveChatDialog(accountId, chatId)

    const onUnblockContact = async () => {
      const confirmed = await openConfirmationDialog({
        message: tx('ask_unblock_contact'),
        confirmLabel: tx('menu_unblock_contact'),
      })

      if (confirmed) {
        await BackendRemote.rpc.unblockContact(accountId, contactId)
      }
    }
    const onBlockContact = () =>
      openBlockFirstContactOfChatDialog(accountId, selectedChat)

    const onDeleteChat = () =>
      openDeleteChatDialog(accountId, selectedChat, chatId)

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
          action: onChatAudit,
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
      !isGroup &&
        !(isSelfTalk || isDeviceChat) &&
        (isBlocked
          ? {
              label: tx('menu_unblock_contact'),
              action: onUnblockContact,
            }
          : {
              label: tx('menu_block_contact'),
              action: onBlockContact,
            }),
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
