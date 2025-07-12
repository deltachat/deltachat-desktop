import React, { useContext, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { Timespans } from '../../../../shared/constants'
import { ContextMenuItem } from '../ContextMenu'
import MailingListProfile from '../dialogs/MailingListProfile'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { unmuteChat } from '../../backend/chat'
import useChat from '../../hooks/chat/useChat'
import { CloneChat } from '../dialogs/CreateChat'
import useChatDialog from '../../hooks/chat/useChatDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useOpenViewGroupDialog from '../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { T } from '@deltachat/jsonrpc-client'
import type { UnselectChat } from '../../contexts/ChatContext'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'

function archiveStateMenu(
  unselectChat: UnselectChat,
  accountId: number,
  chat: T.ChatListItemFetchResult & { kind: 'ChatListItem' },
  tx: ReturnType<typeof useTranslationFunction>,
  isTheSelectedChat: boolean
): { pin: ContextMenuItem; archive: ContextMenuItem } {
  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: () => {
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Archived')
      if (isTheSelectedChat) {
        unselectChat()
      }
    },
  }
  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: () => {
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
      if (isTheSelectedChat) {
        unselectChat()
      }
    },
  }
  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: () => {
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Pinned')

      if (chat.isArchived) {
        unselectChat()
      }
    },
  }
  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: () =>
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal'),
  }

  /*
            Archive	UnArchive	Pin	UnPin
  pinned	  y	      n       	n	  y
  archived  n       y       	y	  n
  normal	  y	      n       	y	  n
  */

  if (chat.isPinned) {
    return { pin: unPin, archive }
  } else if (chat.isArchived) {
    return { pin, archive: unArchive }
  } else {
    // normal
    return { pin, archive }
  }
}

export function useChatListContextMenu(): {
  openContextMenu: (
    event: React.MouseEvent<any, MouseEvent>,
    chatListItem: T.ChatListItemFetchResult & { kind: 'ChatListItem' },
    selectedChatId: number | null
  ) => Promise<void>
  activeContextMenuChatId: number | null
} {
  const { openDialog } = useDialog()
  const {
    openBlockFirstContactOfChatDialog,
    openEncryptionInfoDialog,
    openDeleteChatDialog,
    openLeaveGroupOrChannelDialog,
  } = useChatDialog()
  const openViewGroupDialog = useOpenViewGroupDialog()
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const tx = useTranslationFunction()
  const [activeContextMenuChatId, setActiveContextMenuChatId] = useState<
    number | null
  >(null)

  return {
    activeContextMenuChatId,
    openContextMenu: async (event, chatListItem, selectedChatId) => {
      const onDeleteChat = () =>
        openDeleteChatDialog(accountId, chatListItem, selectedChatId)
      const onEncrInfo = () =>
        openEncryptionInfoDialog({
          chatId: chatListItem.id,
          dmChatContact: chatListItem.dmChatContact,
        })
      const onViewGroup = async () => {
        // throws error if chat was not found
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatListItem.id
        )
        openViewGroupDialog(fullChat)
      }
      const onViewProfile = async () => {
        const fullChat = await BackendRemote.rpc.getFullChatById(
          accountId,
          chatListItem.id
        )
        if (!fullChat) {
          throw new Error('chat was not found')
        }
        if (
          fullChat.chatType !== C.DC_CHAT_TYPE_IN_BROADCAST &&
          fullChat.chatType !== C.DC_CHAT_TYPE_MAILINGLIST
        ) {
          openViewProfileDialog(accountId, fullChat.contactIds[0])
        } else {
          openDialog(MailingListProfile, {
            chat: fullChat,
          })
        }
      }
      const onLeaveGroupOrChannel = () =>
        openLeaveGroupOrChannelDialog(
          accountId,
          chatListItem.id,
          chatListItem.chatType === C.DC_CHAT_TYPE_GROUP
        )
      const onBlockContact = () =>
        openBlockFirstContactOfChatDialog(accountId, chatListItem)
      const onUnmuteChat = () => unmuteChat(accountId, chatListItem.id)

      const { pin, archive } = archiveStateMenu(
        unselectChat,
        accountId,
        chatListItem,
        tx,
        selectedChatId === chatListItem.id
      )

      const isGroup = chatListItem.chatType === C.DC_CHAT_TYPE_GROUP

      const isOutBroadcast =
        chatListItem.chatType === C.DC_CHAT_TYPE_OUT_BROADCAST

      const menu: (ContextMenuItem | false)[] = [
        // Pin
        pin,
        // Mute
        !chatListItem.isMuted
          ? {
              label: tx('menu_mute'),
              subitems: [
                {
                  label: tx('mute_for_one_hour'),
                  action: () => {
                    BackendRemote.rpc.setChatMuteDuration(
                      accountId,
                      chatListItem.id,
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
                      chatListItem.id,
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
                      chatListItem.id,
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
                      chatListItem.id,
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
                      chatListItem.id,
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
        // Archive
        archive,
        { type: 'separator' },
        // View Profile
        !isGroup && {
          label: tx('menu_view_profile'),
          action: onViewProfile,
        },
        // View Group Profile (for non encrypted groups)
        isGroup &&
          !chatListItem.isEncrypted &&
          chatListItem.isSelfInGroup && {
            label: tx('menu_view_profile'),
            action: onViewGroup,
          },
        // Edit Group
        isGroup &&
          chatListItem.isEncrypted &&
          chatListItem.isSelfInGroup && {
            label: tx('menu_edit_group'),
            dataTestid: 'edit-group',
            action: onViewGroup,
          },
        // Edit Channel
        isOutBroadcast && {
          label: tx('edit_channel'),
          action: onViewGroup,
        },
        // Clone Group
        isGroup && {
          label: tx('clone_chat'),
          action: () => {
            openDialog(CloneChat, {
              setViewMode: 'createGroup',
              chatTemplateId: chatListItem.id,
            })
          },
        },

        // Encryption Info
        !chatListItem.isDeviceTalk &&
          !chatListItem.isSelfTalk && {
            label: tx('encryption_info_title_desktop'),
            action: onEncrInfo,
          },
        { type: 'separator' },
        // Leave channel
        chatListItem.chatType === C.DC_CHAT_TYPE_IN_BROADCAST &&
          !chatListItem.isContactRequest && {
            label: tx('menu_leave_channel'),
            action: onLeaveGroupOrChannel,
          },
        // Leave group
        isGroup &&
          chatListItem.isEncrypted &&
          chatListItem.isSelfInGroup && {
            label: tx('menu_leave_group'),
            action: onLeaveGroupOrChannel,
          },
        // Block contact
        !isGroup &&
          !(
            chatListItem.isSelfTalk ||
            chatListItem.isDeviceTalk ||
            isOutBroadcast
          ) && {
            label: tx('menu_block_contact'),
            action: onBlockContact,
          },
        // Delete
        {
          label: tx('menu_delete_chat'),
          action: onDeleteChat,
        },
      ]

      event.preventDefault() // prevent default runtime context menu from opening

      setActiveContextMenuChatId(chatListItem.id)
      await openContextMenu({
        ...mouseEventToPosition(event),
        items: menu,
      })
      setActiveContextMenuChatId(null)
    },
  }
}
