import React, { useCallback, useRef } from 'react'
import { areEqual } from 'react-window'

import ChatListItem, {
  PlaceholderChatListItem,
  ChatListItemMessageResult,
} from './ChatListItem'
import { ContactListItem } from '../contact/ContactListItem'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useMessage from '../../hooks/chat/useMessage'
import { selectedAccountId } from '../../ScreenController'

import type { T } from '@deltachat/jsonrpc-client'
import type { useChatListContextMenu } from './ChatListContextMenu'
import type { useMultiselect } from '../../hooks/useMultiselect'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('ChatListItemRow')

export type ChatListItemData = {
  activeChatId: number | null
  /**
   * Whether to set `role='tab'` on the items.
   *
   * Note that this doesn't apply to some items,
   * such as `ChatListItemArchiveLink`.
   *
   * @default false
   */
  roleTabs?: boolean
  // multiselectSelectedChatIds?: Set<T.BasicChat['id']>
  multiselect?: ReturnType<typeof useMultiselect<T.BasicChat['id']>> & {
    setSelectedChats: (newItems: Set<T.BasicChat['id']>) => void
  }
  // multiselectSetSelectedItems?: (newItems: Set<T.BasicChat['id']>) => void
  chatListIds: number[]
  chatCache: {
    [id: number]: T.ChatListItemFetchResult | undefined
  }
  onChatClick: (chatId: number) => void
  // onChatClick: (event: React.MouseEvent, chatId: number) => void
  // onChatFocus?: (chatId: number) => void
  openContextMenu: ReturnType<typeof useChatListContextMenu>['openContextMenu']
  activeContextMenuChatIds: ReturnType<
    typeof useChatListContextMenu
  >['activeContextMenuChatIds']
}

export type MessageChatListItemData = {
  messageResultIds: number[]
  messageCache: {
    [id: number]: T.MessageSearchResult | undefined
  }
  queryStr: string | undefined
  /**
   * Whether the user is searching for messages in just a single chat.
   */
  isSingleChatSearch: boolean
}

export type ContactChatListItemData = {
  contactCache: {
    [id: number]: T.Contact | undefined
  }
  contactIds: number[]
}

export const ChatListItemRowChat = React.memo<{
  index: number
  data: ChatListItemData
  style: React.CSSProperties
}>(({ index, data, style }) => {
  const {
    activeChatId,
    roleTabs,
    multiselect,
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
    activeContextMenuChatIds,
  } = data
  const chatId = chatListIds[index]
  const chat = chatCache[chatId]

  const multiselectOnClick = multiselect?.onClick
  const onChatClick2 = useCallback(
    (e: React.MouseEvent) => {
      let shouldPreventDefault = false
      if (multiselectOnClick) {
        shouldPreventDefault = multiselectOnClick(e, chatId)
      }
      if (shouldPreventDefault) {
        // This doesn't really do anything as of writing.
        // Not calling `onChatClick` is enough.
        e.preventDefault()
        return
      }

      onChatClick(chatId)
    },
    [chatId, multiselectOnClick, onChatClick]
  )
  // Using refs to avoid re-renders, because `ChatListItem` is memoized.
  // TODO `useRef` docs recommend against updating refs during rendering.
  // Is it bad in this case?
  const onChatClick2Ref = useRef(onChatClick2)
  onChatClick2Ref.current = onChatClick2

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      // So, do we handle archive link multiselect here?
      if (chat == null) {
        // Probably still loading.
        // TODO can this be a loading error though?
        return
      }
      if (chat.kind === 'Error') {
        // TODO again, should we still handle this somehow?
        // At he very least we know the chat ID,
        // so we can still e.g. delete it.
        return
      }
      if (chat.kind === 'ArchiveLink') {
        // This is a special case, not so much of a "chat list item".
        // It has its own `onContextMenu` handler,
        // so here we don't need to do anything.
        return
      }
      // IDK why TypeScript can't admit that this is true, but it is.
      // const _assert: true = chat.kind === 'ChatListItem'

      const thisChatId = chatId
      const thisChat = chat

      if (multiselect == undefined) {
        openContextMenu(event, [thisChat], activeChatId)
        return
      }

      // let targetChats = multiselect ? multiselect.selectedItems : new Set([thisChatId])
      if (!multiselect.selectedItems.has(thisChatId)) {
        // Invoked a context menu that is not among multiselected chats.
        openContextMenu(event, [thisChat], activeChatId)

        // Reset selection.
        // We could have set this to `new Set([thisChatId])`,
        // which would probably make more sense,
        // but the problem would be that the selection would not get
        // reset back to `activeChatId` even after the context menu is closed,
        // which would be confusing to people who don't use
        // the multiselect feature.
        // This is another argument for styling the active chat differently
        // from selected chats.
        // TODO reconsider this.
        multiselect.setSelectedChats(new Set())

        return
      }

      const targetChats = [...multiselect.selectedItems.values()].map(
        chatId => chatCache[chatId]
      )
      // TODO fix: while in practice most of the time all the chats are loaded,
      // because they have been Ctrl / Shift + Clicked by the user,
      // it's not guaranteed.
      // For example, if the user scrolled past a lot of chats
      // and Shift selected all of them.
      //
      // What we should probably do is to call the `loadChats`
      // function that the infinite loader uses.
      //
      // But we probably should not assume that chats are never unloaded
      // from `chatCache`.
      const targetChatsFiltered = targetChats.filter(
        chat => chat != undefined && chat.kind === 'ChatListItem'
      )
      if (targetChatsFiltered.length !== multiselect.selectedItems.size) {
        log.error(
          'Failed to open context menu for multiple chats:',
          'one of the chats is either not loaded or not a ChatListItem',
          multiselect.selectedItems,
          targetChats
        )
        return
      }
      // TODO this returns a promise, nice!
      // Reset selection to active chat?
      // Maybe use a ref for it, in case it changes in the mean time?
      // Also above.
      //
      // Or should we do it here? Maybe the user
      // wants to do several actions.
      // We should only do it above, I think,
      // see "Invoked a context menu that is not among multiselected chats.".
      //
      // Maybe we need to add a function to `multiselect` so it's all
      // in one place, inside the hook.
      openContextMenu(event, targetChatsFiltered, activeChatId)
    },
    [chat, chatCache, chatId, multiselect, openContextMenu, activeChatId]
  )
  const onContextMenuRef = useRef(onContextMenu)
  onContextMenuRef.current = onContextMenu

  const multiselectOnFocus = multiselect?.onFocus
  const onFocus = useCallback(
    (_e: React.FocusEvent) => {
      multiselectOnFocus?.(chatId)
    },
    [chatId, multiselectOnFocus]
  )
  const onFocusRef = useRef(onFocus)
  onFocusRef.current = onFocus

  return (
    <li style={style}>
      <ChatListItem
        roleTab={roleTabs}
        isSelected={
          multiselect
            ? // When `multiselect` is provided, we don't need
              // to also check `activeChatId === chatId`, because multiselect
              // also follows it during "normal" usage,
              // including switching the active chat with shortcuts
              // and through notifications.
              //
              // TODO however, for completeness and to avoid confusion,
              // we should probably add a distinct `isActive` prop,
              // and a separate style for `isSelected`.
              // Because it's possible to, for example, unselect all chats,
              // or to select just a single chat that is not the activeChatId.
              multiselect.selectedItems.has(chatId)
            : activeChatId === chatId
        }
        chatListItem={chat}
        onClick={useCallback(event => onChatClick2Ref.current(event), [])}
        onFocus={useCallback(
          (event: React.FocusEvent) => onFocusRef.current(event),
          []
        )}
        onContextMenu={useCallback(
          (event: React.MouseEvent) => onContextMenuRef.current(event),
          []
        )}
        isContextMenuActive={activeContextMenuChatIds.includes(chatId)}
      />
    </li>
  )
}, areEqual)

export const ChatListItemRowContact = React.memo<{
  index: number
  data: ContactChatListItemData
  style: React.CSSProperties
}>(({ index, data, style }) => {
  const { contactCache, contactIds } = data
  const contactId = contactIds[index]
  const contact = contactCache[contactId]
  const accountId = selectedAccountId()
  const openViewProfileDialog = useOpenViewProfileDialog()

  return contact ? (
    <ContactListItem
      tagName='li'
      style={style}
      contact={contact}
      showCheckbox={false}
      checked={false}
      showRemove={false}
      onClick={async _ => {
        openViewProfileDialog(accountId, contactId)
      }}
    />
  ) : (
    <li style={style}>
      <PlaceholderChatListItem />
    </li>
  )
}, areEqual)

export const ChatListItemRowMessage = React.memo<{
  index: number
  data: MessageChatListItemData
  style: React.CSSProperties
}>(({ index, data, style }) => {
  const { messageResultIds, messageCache, queryStr, isSingleChatSearch } = data
  const msrId = messageResultIds[index]
  const messageSearchResult = messageCache[msrId]
  const { jumpToMessage } = useMessage()
  const accountId = selectedAccountId()

  return (
    <li style={style}>
      {messageSearchResult ? (
        <ChatListItemMessageResult
          queryStr={queryStr || ''}
          msr={messageSearchResult}
          isSingleChatSearch={isSingleChatSearch}
          onClick={() => {
            jumpToMessage({
              accountId,
              msgId: msrId,
              msgChatId: messageSearchResult.chatId,
              focus: false,
              scrollIntoViewArg: { block: 'center' },
            })
          }}
        />
      ) : (
        <div className='pseudo-chat-list-item skeleton' />
      )}
    </li>
  )
}, areEqual)
