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
  activeChatId: number | null
): { pin: ContextMenuItem | null; archive: ContextMenuItem } {
  const batchAction = (fn: (chat: ChatListItem) => Promise<unknown>) => () =>
    Promise.all(chats.map(chat => fn(chat)))

  const archive: ContextMenuItem = {
    label: tx('menu_archive_chat'),
    action: batchAction(async chat => {
      if (chat.id === activeChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Archived')
    }),
  }

  const unArchive: ContextMenuItem = {
    label: tx('menu_unarchive_chat'),
    action: batchAction(async chat => {
      if (chat.id === activeChatId) {
        unselectChat()
      }
      await BackendRemote.rpc.setChatVisibility(accountId, chat.id, 'Normal')
    }),
  }

  const pin: ContextMenuItem = {
    label: tx('pin_chat'),
    action: batchAction(async chat => {
      if (chat.id === activeChatId && chat.isArchived) {
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
  archived    n       y       n      n
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

  const hasNotMutedChats = chats.some(item => !item.isMuted)

  if (hasNotMutedChats) {
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
 * Builds view/edit profile menu items for a chat in chat list
 */
function buildViewEditMenuItems(
  relatedChat: T.FullChat,
  openDialog: ReturnType<typeof useDialog>['openDialog'],
  openViewGroupDialog: ReturnType<typeof useOpenViewGroupDialog>,
  openViewProfileDialog: ReturnType<typeof useOpenViewProfileDialog>,
  accountId: number,
  tx: ReturnType<typeof useTranslationFunction>
): (ContextMenuItem | false)[] {
  const onViewProfile = async () => {
    if (
      relatedChat.chatType !== 'InBroadcast' &&
      relatedChat.chatType !== 'Mailinglist'
    ) {
      openViewProfileDialog(accountId, relatedChat.contactIds[0])
    } else {
      openDialog(MailingListProfile, {
        chat: relatedChat as T.FullChat & {
          chatType: typeof relatedChat.chatType
        },
      })
    }
  }

  const onViewGroup = async () => {
    openViewGroupDialog(
      relatedChat as T.FullChat & { chatType: 'Group' | 'OutBroadcast' }
    )
  }

  const selfInGroup =
    relatedChat.chatType === 'Group' && relatedChat.selfInGroup

  return [
    (relatedChat.chatType === 'Single' ||
      relatedChat.chatType === 'InBroadcast') &&
      !relatedChat.isDeviceChat && {
        label: tx('menu_view_profile'),
        action: onViewProfile,
      },
    selfInGroup && {
      label: tx('menu_view_profile'),
      dataTestid: 'edit-group',
      action: onViewGroup,
    },
    // Edit Channel
    relatedChat.chatType === 'OutBroadcast' && {
      label: tx('edit_channel'),
      action: onViewGroup,
    },
  ]
}

/**
 * Builds encryption info menu item
 */
function buildEncryptionInfoMenuItem(
  relatedChat: T.FullChat,
  tx: ReturnType<typeof useTranslationFunction>,
  openEncryptionInfoDialog: (info: {
    chatId: number | null
    dmChatContact: number | null
  }) => void
): ContextMenuItem | false {
  return (
    !relatedChat.isDeviceChat &&
    !relatedChat.isSelfTalk && {
      label: tx('encryption_info_title_desktop'),
      action: () =>
        openEncryptionInfoDialog({
          chatId: relatedChat.id,
          dmChatContact: relatedChat.contactIds[0] ?? null,
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
    activeChatId: number | null
  ) => Promise<void>
  openMainViewContextMenu: (
    event: React.MouseEvent<any, MouseEvent>,
    activeChat: T.FullChat
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
   * @param chatListItems array of selected chat list items
   * @param activeChatId the id of the currently active chat (null if no chat is active)
   */
  const openChatListContextMenu = async (
    event: React.MouseEvent<any, MouseEvent>,
    chatListItems: ChatListItem[],
    activeChatId: number | null
  ) => {
    // only if chatListItems contains a single chat, we need the full chat
    const selectedChat =
      chatListItems.length === 1
        ? await BackendRemote.rpc.getFullChatById(
            accountId,
            chatListItems[0].id
          )
        : undefined
    return openContextMenuInternalHandler(
      event,
      selectedChat,
      chatListItems,
      activeChatId,
      false
    )
  }

  /**
   * @param activeChat the chat the context menu is opened for
   */
  const openMainViewContextMenu = async (
    event: React.MouseEvent<any, MouseEvent>,
    activeChat: T.FullChat
  ) => {
    return openContextMenuInternalHandler(
      event,
      activeChat,
      [fullChatToChatListItem(activeChat)],
      activeChat.id,
      true
    )
  }

  /**
   * @param relatedChat the chat the context menu is opened for (undefined if multiple chats are selected)
   * @param chatListItems array of selected chat list items (in main view the active chat only)
   * @param activeChatId the id of the currently active chat (null if no chat is active)
   * @param isMainView whether the context menu is opened from main chat view or chat list
   *
   */
  const openContextMenuInternalHandler = async (
    event: React.MouseEvent<any, MouseEvent>,
    relatedChat: T.FullChat | undefined,
    chatListItems: ChatListItem[],
    activeChatId: number | null,
    isMainView: boolean
  ) => {
    if (chatListItems.length === 0 && relatedChat === undefined) {
      log.error('openContextMenu called with 0 chats')
      return
    }
    if (isMainView && !relatedChat) {
      throw new Error('related chat must be defined when isMainView is true')
    }

    const isGroup = relatedChat && relatedChat.chatType === 'Group'
    const isOutBroadcast =
      relatedChat && relatedChat.chatType === 'OutBroadcast'

    // Menu item actions
    const onDeleteChats = () =>
      openDeleteChatsDialog(accountId, chatListItems, activeChatId)

    const onLeaveGroupOrChannel = (chat: T.FullChat) =>
      openLeaveGroupOrChannelDialog(
        accountId,
        chat.id,
        chat.chatType === 'Group'
      )

    const onBlockContact = (chat: T.FullChat) =>
      openBlockFirstContactOfChatDialog(accountId, chat)

    const onClearChat = () => {
      if (isMainView && relatedChat) {
        openClearChatDialog(accountId, relatedChat.id)
      }
    }

    const onDisappearingMessages = () => {
      if (relatedChat === undefined) {
        return
      }
      openDialog(DisappearingMessages, {
        chatId: relatedChat.id,
      })
    }

    const onSearchInChat = () => {
      window.__chatlistSetSearch?.('', activeChatId)
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
      activeChatId
    )

    const muteMenuItem = buildMuteMenuItem(chatListItems, accountId, tx)

    // View and Edit menu items are only shown
    // in chat list if a single chat is selected
    const viewEditMenuItems =
      isMainView || relatedChat === undefined
        ? []
        : buildViewEditMenuItems(
            relatedChat,
            openDialog,
            openViewGroupDialog,
            openViewProfileDialog,
            accountId,
            tx
          )

    // Encryption info is only shown in chatlist and
    // only if a single chat is selected
    const encryptionInfoItem =
      relatedChat !== undefined
        ? buildEncryptionInfoMenuItem(relatedChat, tx, openEncryptionInfoDialog)
        : null

    const ephemeralMessagesMenuItem = isMainView &&
      relatedChat &&
      relatedChat.canSend &&
      relatedChat.chatType !== 'InBroadcast' &&
      relatedChat.chatType !== 'Mailinglist' &&
      relatedChat.isEncrypted && {
        label: tx('ephemeral_messages'),
        action: onDisappearingMessages,
      }

    const showBlockContactOption =
      relatedChat &&
      !isGroup &&
      !relatedChat.isSelfTalk &&
      !relatedChat.isDeviceChat &&
      !isOutBroadcast &&
      relatedChat.chatType !== 'InBroadcast'

    const showLeaveGroupOption =
      relatedChat &&
      isGroup &&
      relatedChat.isEncrypted &&
      relatedChat.selfInGroup &&
      !relatedChat.isContactRequest

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
      relatedChat &&
        isGroup && {
          label: tx('clone_chat'),
          action: () => {
            openDialog(CloneChat, {
              setViewMode: 'createGroup',
              chatTemplateId: relatedChat.id,
            })
          },
        },
      // Leave channel
      relatedChat &&
        relatedChat.chatType === 'InBroadcast' &&
        !relatedChat.isContactRequest && {
          label: tx('menu_leave_channel'),
          action: () => onLeaveGroupOrChannel(relatedChat),
          danger: true,
        },
      showLeaveGroupOption && {
        label: tx('menu_leave_group'),
        action: () => onLeaveGroupOrChannel(relatedChat),
        danger: true,
      },
      // Block contact
      showBlockContactOption && {
        label: tx('menu_block_contact'),
        action: () => onBlockContact(relatedChat),
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
      ariaAttrs: isMainView
        ? { 'aria-labelledby': 'three-dot-menu-button' }
        : {
            'aria-label': tx('chat_list_item_menu_label'),
          },
    })
    setActiveContextMenuChatIds([])
  }

  return {
    activeContextMenuChatIds,
    openContextMenu: openChatListContextMenu,
    openMainViewContextMenu,
  }
}
