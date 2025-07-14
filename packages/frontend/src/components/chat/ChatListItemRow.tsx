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
  chatListIds: number[]
  chatCache: {
    [id: number]: T.ChatListItemFetchResult | undefined
  }
  onChatClick: (chatId: number) => void
  openContextMenu: ReturnType<typeof useChatListContextMenu>['openContextMenu']
  activeContextMenuChatId: ReturnType<
    typeof useChatListContextMenu
  >['activeContextMenuChatId']
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
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
    activeContextMenuChatId,
  } = data
  const chatId = chatListIds[index]
  const chat = chatCache[chatId]

  // Using refs to avoid re-renders, because `ChatListItem` is memoized.
  // TODO `useRef` docs recomment against updating refs during rendering.
  // Is it bad in this case?
  const onChatClickRef = useRef(onChatClick)
  onChatClickRef.current = onChatClick

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (chat?.kind === 'ChatListItem') {
        openContextMenu(event, chat, activeChatId)
      }
    },
    [chat, openContextMenu, activeChatId]
  )
  const onContextMenuRef = useRef(onContextMenu)
  onContextMenuRef.current = onContextMenu

  return (
    <li style={style}>
      <ChatListItem
        roleTab={roleTabs}
        isSelected={activeChatId === chatId}
        chatListItem={chat}
        onClick={useCallback(() => onChatClickRef.current(chatId), [chatId])}
        onContextMenu={useCallback(
          (event: React.MouseEvent) => onContextMenuRef.current(event),
          []
        )}
        isContextMenuActive={activeContextMenuChatId === chatId}
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
