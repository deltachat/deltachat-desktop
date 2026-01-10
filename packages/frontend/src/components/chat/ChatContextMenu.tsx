import React, { useContext, useState } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

import { Timespans } from '@deltachat-desktop/shared/constants'
import { ContextMenuItem } from '../ContextMenu'
import MailingListProfile from '../dialogs/MailingListProfile'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import useChat from '../../hooks/chat/useChat'
import { CloneChat } from '../dialogs/CreateChat'
import useChatDialog from '../../hooks/chat/useChatDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useOpenViewGroupDialog from '../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import DisappearingMessages from '../dialogs/DisappearingMessages'
import type { UnselectChat } from '../../contexts/ChatContext'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { ActionEmitter, KeybindAction } from '../../keybindings'

const log = getLogger('ChatListContextMenu')

/**
 * Reduced type containing only the properties from ChatListItemFetchResult
 * that are actually needed by the ChatContextMenu
 */
type ChatListItem = Pick<
  T.ChatListItemFetchResult & { kind: 'ChatListItem' },
  | 'kind'
  | 'id'
  | 'name'
  | 'chatType'
  | 'isPinned'
  | 'isArchived'
  | 'isMuted'
  | 'isDeviceTalk'
  | 'isSelfTalk'
  | 'isSelfInGroup'
  | 'isContactRequest'
  | 'isEncrypted'
  | 'dmChatContact'
>

/**
 * Converts a FullChat object into a reduced ChatListItem
 */
export function fullChatToChatListItem(chat: T.FullChat): ChatListItem {
  return {
    kind: 'ChatListItem',
    id: chat.id,
    name: chat.name,
    chatType: chat.chatType,
    isPinned: chat.pinned,
    isArchived: chat.archived,
    isMuted: chat.isMuted,
    isDeviceTalk: chat.isDeviceChat,
    isSelfTalk: chat.isSelfTalk,
    isSelfInGroup: chat.selfInGroup,
    isContactRequest: chat.isContactRequest,
    isEncrypted: chat.isEncrypted,
    // https://github.com/chatmail/core/blob/a3328ea2de1e675b1418b4e2ca0c23f88828c558/deltachat-jsonrpc/src/api/types/chat_list.rs#L130-L146
    dmChatContact:
      chat.chatType === 'Single' && chat.contactIds.length > 0
        ? chat.contactIds[0]
        : null,
  }
}

/**
 * Builds archive and pin menu items based on chat states
 */
function buildArchiveAndPinMenuItems(
  unselectChat: UnselectChat,
  accountId: number,
  chats: ChatListItem[],
  tx: ReturnType<typeof useTranslationFunction>,
  selectedChatId: number | null
): { pin: ContextMenuItem | null; archive: ContextMenuItem } {
  const batchAction = (fn: (chat: ChatListItem) => Promise<unknown>) => () =>
    Promise.all(chats.map(chat => fn(chat)))

  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: batchAction(async chat => {
      if (chat.id === selectedChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Archived')
    }),
  }

  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: batchAction(async chat => {
      if (chat.id === selectedChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    }),
  }

  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: batchAction(async chat => {
      if (chat.id === selectedChatId && chat.isArchived) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Pinned')
    }),
  }

  const unPin: ContextMenuItem = {
    label: tx('unpin_chat'),
    action: batchAction(chat =>
      BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    ),
  }

  /*      Archive  UnArchive  Pin  UnPin
  pinned      y       n       n      y
  archived    n       y       y      n
  normal      y       n       y      n
  */

  // Determine which menu items to show based on chat states
  if (chats.every(chat => chat.isPinned)) {
    return { pin: unPin, archive }
  } else if (chats.every(chat => chat.isArchived)) {
    return { pin: null, archive: unArchive }
  } else {
    return { pin, archive }
  }
}

/**
 * Builds mute/unmute menu items based on chat states
 */
function buildMuteMenuItem(
  chats: ChatListItem[],
  accountId: number,
  tx: ReturnType<typeof useTranslationFunction>
): ContextMenuItem {
  const batchAction = (fn: (chat: ChatListItem) => Promise<unknown>) => () =>
    Promise.all(chats.map(chat => fn(chat)))

  const hasMutedChats = chats.some(item => !item.isMuted)

  if (hasMutedChats) {
    return {
      label: tx('menu_mute'),
      subitems: [
        ...[
          {
            label: tx('mute_for_one_hour'),
            duration: Timespans.ONE_HOUR_IN_SECONDS,
          },
          {
            label: tx('mute_for_eight_hours'),
            duration: Timespans.ONE_HOUR_IN_SECONDS * 8,
          },
          {
            label: tx('mute_for_one_day'),
            duration: Timespans.ONE_DAY_IN_SECONDS,
          },
          {
            label: tx('mute_for_seven_days'),
            duration: Timespans.ONE_WEEK_IN_SECONDS,
          },
        ].map(({ label, duration }) => ({
          label,
          action: batchAction(chat =>
            BackendRemote.rpc.setChatMuteDuration(accountId, chat.id, {
              kind: 'Until',
              duration,
            })
          ),
        })),
        {
          label: tx('mute_forever'),
          action: batchAction(chat =>
            BackendRemote.rpc.setChatMuteDuration(accountId, chat.id, {
              kind: 'Forever',
            })
          ),
        },
      ],
    }
  } else {
    return {
      label: tx('menu_unmute'),
      action: batchAction(chat =>
        BackendRemote.rpc.setChatMuteDuration(accountId, chat.id, {
          kind: 'NotMuted',
        })
      ),
    }
  }
}

/**
 * Builds view/edit profile menu items for chats
 */
function buildViewEditMenuItems(
  singleChat: ChatListItem | undefined,
  selectedChat: T.FullChat | undefined,
  openDialog: ReturnType<typeof useDialog>['openDialog'],
  openViewGroupDialog: ReturnType<typeof useOpenViewGroupDialog>,
  openViewProfileDialog: ReturnType<typeof useOpenViewProfileDialog>,
  accountId: number,
  tx: ReturnType<typeof useTranslationFunction>
): (ContextMenuItem | false)[] {
  if (!singleChat) return []

  const onViewProfile = async () => {
    const fullChat =
      selectedChat ??
      (await BackendRemote.rpc.getFullChatById(accountId, singleChat.id))
    if (!fullChat) {
      throw new Error('chat was not found')
    }
    if (
      fullChat.chatType !== 'InBroadcast' &&
      fullChat.chatType !== 'Mailinglist'
    ) {
      openViewProfileDialog(accountId, fullChat.contactIds[0])
    } else {
      openDialog(MailingListProfile, {
        chat: fullChat as T.FullChat & {
          chatType: 'InBroadcast' | 'Mailinglist'
        },
      })
    }
  }

  const onViewGroup = async () => {
    const fullChat =
      selectedChat ??
      (await BackendRemote.rpc.getFullChatById(accountId, singleChat.id))
    openViewGroupDialog(
      fullChat as T.FullChat & { chatType: 'Group' | 'OutBroadcast' }
    )
  }

  const selfInGroup =
    singleChat.chatType === 'Group' && singleChat.isSelfInGroup

  return [
    // View Profile (for single chats)
    (singleChat.chatType === 'Single' ||
      singleChat.chatType === 'InBroadcast') &&
      !singleChat.isDeviceTalk && {
        label: tx('menu_view_profile'),
        action: onViewProfile,
      },
    selfInGroup && {
      label: tx('menu_view_profile'),
      dataTestid: 'edit-group',
      action: onViewGroup,
    },
    // Edit Channel
    singleChat.chatType === 'OutBroadcast' && {
      label: tx('edit_channel'),
      action: onViewGroup,
    },
  ]
}

/**
 * Builds encryption info menu item
 */
function buildEncryptionInfoMenuItem(
  singleChat: ChatListItem | undefined,
  tx: ReturnType<typeof useTranslationFunction>,
  openEncryptionInfoDialog: (info: {
    chatId: number | null
    dmChatContact: number | null
  }) => void
): ContextMenuItem | false {
  if (!singleChat) return false

  return (
    !singleChat.isDeviceTalk &&
    !singleChat.isSelfTalk && {
      label: tx('encryption_info_title_desktop'),
      action: () =>
        openEncryptionInfoDialog({
          chatId: singleChat.id,
          dmChatContact: singleChat.dmChatContact,
        }),
    }
  )
}

/**
 * provides a context menu for chat list items
 * and for the 3dot menu in main chat view
 */
export function useChatContextMenu(): {
  openContextMenu: (
    event: React.MouseEvent<any, MouseEvent>,
    chatListItems: ChatListItem[],
    selectedChatId: number | null,
    selectedChat?: T.FullChat
  ) => Promise<void>
  activeContextMenuChatIds: number[]
} {
  const { openDialog } = useDialog()
  const {
    openBlockFirstContactOfChatDialog,
    openEncryptionInfoDialog,
    openDeleteChatsDialog,
    openLeaveGroupOrChannelDialog,
    openClearChatDialog,
  } = useChatDialog()
  const openViewGroupDialog = useOpenViewGroupDialog()
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { openContextMenu } = useContext(ContextMenuContext)
  const accountId = selectedAccountId()
  const { unselectChat } = useChat()
  const tx = useTranslationFunction()
  const [activeContextMenuChatIds, setActiveContextMenuChatIds] = useState<
    number[]
  >([])

  /**
   * @param chatListItems array of selected chat list items (empty if opened from main chat view)
   * @param selectedChatId id of the currently selected chat (null if none selected)
   * @param selectedChat the currently active chat (only in main view)
   */
  const openContextMenuHandler = async (
    event: React.MouseEvent<any, MouseEvent>,
    chatListItems: ChatListItem[],
    selectedChatId: number | null,
    selectedChat?: T.FullChat
  ) => {
    if (chatListItems.length === 0 && selectedChat === undefined) {
      log.error('openContextMenu called with 0 chats')
      return
    }
    // true if opened from main chat view (not from list)
    const isMainView = !!selectedChat

    const multipleChatsSelected = chatListItems.length > 1

    // Determine use case:
    // 1. multiple selected chats in chat list (multipleChatsSelected = true, singleChat = undefined)
    // 2. single selected chat in chat list
    // 3. no selected chat in chat list, but main view chat
    const singleChat: ChatListItem | undefined = isMainView
      ? fullChatToChatListItem(selectedChat)
      : chatListItems.length === 1
        ? chatListItems[0]
        : undefined

    if (chatListItems.length === 0 && singleChat) {
      chatListItems.push(singleChat)
    }
    const isGroup = singleChat && singleChat.chatType === 'Group'
    const isOutBroadcast = singleChat && singleChat.chatType === 'OutBroadcast'

    // Menu item actions
    const onDeleteChats = () =>
      openDeleteChatsDialog(accountId, chatListItems, selectedChatId)

    const onLeaveGroupOrChannel = (chat: ChatListItem) =>
      openLeaveGroupOrChannelDialog(
        accountId,
        chat.id,
        chat.chatType === 'Group'
      )

    const onBlockContact = (chat: ChatListItem) =>
      openBlockFirstContactOfChatDialog(accountId, chat)

    const onClearChat = () => {
      if (isMainView) {
        openClearChatDialog(accountId, selectedChat.id)
      }
    }

    const onDisappearingMessages = () => {
      if (selectedChatId === null) {
        return
      }
      openDialog(DisappearingMessages, {
        chatId: selectedChatId,
      })
    }

    const onSearchInChat = () => {
      window.__chatlistSetSearch?.('', selectedChatId)
      setTimeout(
        () => ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput),
        0
      )
    }

    // Prepare menu items

    const { pin, archive } = buildArchiveAndPinMenuItems(
      unselectChat,
      accountId,
      chatListItems,
      tx,
      selectedChatId
    )

    const muteMenuItem = buildMuteMenuItem(chatListItems, accountId, tx)

    // View and Edit menu items
    const viewEditMenuItems = multipleChatsSelected
      ? []
      : buildViewEditMenuItems(
          singleChat,
          selectedChat,
          openDialog,
          openViewGroupDialog,
          openViewProfileDialog,
          accountId,
          tx
        )

    const encryptionInfoItem = multipleChatsSelected
      ? null
      : buildEncryptionInfoMenuItem(singleChat, tx, openEncryptionInfoDialog)

    const ephemeralMessagesMenuItem = isMainView &&
      selectedChat.canSend &&
      selectedChat.chatType !== 'InBroadcast' &&
      selectedChat.chatType !== 'Mailinglist' &&
      selectedChat.isEncrypted && {
        label: tx('ephemeral_messages'),
        action: onDisappearingMessages,
      }

    const showBlockContactOption =
      singleChat &&
      !isGroup &&
      !singleChat.isSelfTalk &&
      !singleChat.isDeviceTalk &&
      !isOutBroadcast &&
      singleChat.chatType !== 'InBroadcast'

    const showLeaveGroupOption =
      singleChat &&
      isGroup &&
      singleChat.isEncrypted &&
      singleChat.isSelfInGroup &&
      !singleChat.isContactRequest

    // Build the complete menu
    const menu: (ContextMenuItem | false)[] = [
      isMainView && {
        label: tx('search_in_chat'),
        action: onSearchInChat,
      },
      !isMainView && pin,
      archive,
      ephemeralMessagesMenuItem,
      muteMenuItem,
      { type: 'separator' },
      ...(!isMainView ? viewEditMenuItems : []),
      // Clone Group
      singleChat &&
        isGroup && {
          label: tx('clone_chat'),
          action: () => {
            openDialog(CloneChat, {
              setViewMode: 'createGroup',
              chatTemplateId: singleChat.id,
            })
          },
        },
      // Leave channel
      singleChat &&
        singleChat.chatType === 'InBroadcast' &&
        !singleChat.isContactRequest && {
          label: tx('menu_leave_channel'),
          action: () => onLeaveGroupOrChannel(singleChat),
          danger: true,
        },
      showLeaveGroupOption && {
        label: tx('menu_leave_group'),
        action: () => onLeaveGroupOrChannel(singleChat),
        danger: true,
      },
      // Block contact
      showBlockContactOption && {
        label: tx('menu_block_contact'),
        action: () => onBlockContact(singleChat),
        danger: true,
      },
      isMainView && {
        label: tx('clear_chat'),
        action: onClearChat,
        danger: true,
      },
      {
        label: tx('menu_delete_chat'),
        action: onDeleteChats,
        danger: true,
      },
      !isMainView && encryptionInfoItem,
    ].filter(Boolean) as ContextMenuItem[]

    event.preventDefault()

    setActiveContextMenuChatIds(chatListItems.map(item => item.id))
    await openContextMenu({
      ...mouseEventToPosition(event),
      items: menu,
      ariaAttrs: {
        'aria-label': tx('chat_list_item_menu_label'),
      },
    })
    setActiveContextMenuChatIds([])
  }

  return {
    activeContextMenuChatIds,
    openContextMenu: openContextMenuHandler,
  }
}
