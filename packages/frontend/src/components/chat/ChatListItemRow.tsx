import React from 'react'
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
  selectedChatId: number | null
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
    selectedChatId,
    roleTabs,
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
    activeContextMenuChatId,
  } = data
  const chatId = chatListIds[index]

  return (
    <li style={style}>
      <ChatListItem
        roleTab={roleTabs}
        isSelected={selectedChatId === chatId}
        chatListItem={chatCache[chatId] || undefined}
        onClick={onChatClick.bind(null, chatId)}
        onContextMenu={event => {
          const chat = chatCache[chatId]
          if (chat?.kind === 'ChatListItem') {
            openContextMenu(event, chat, selectedChatId)
          }
        }}
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
