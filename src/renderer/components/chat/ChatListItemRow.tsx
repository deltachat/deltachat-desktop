import React from 'react'
import { areEqual } from 'react-window'

import ChatListItem, {
  PlaceholderChatListItem,
  ChatListItemMessageResult,
} from './ChatListItem'
import { ContactListItem } from '../contact/ContactListItem'
import { jumpToMessage, openViewProfileDialog } from '../helpers/ChatMethods'
import { Type } from '../../backend-com'

import type { useChatListContextMenu } from './ChatListContextMenu'
import { OpenDialog } from '../../contexts/DialogContext'

export const ChatListItemRowChat = React.memo<{
  index: number
  data: {
    selectedChatId: number | null
    chatListIds: number[]
    chatCache: {
      [id: number]: Type.ChatListItemFetchResult | undefined
    }
    onChatClick: (chatId: number) => void
    openContextMenu: ReturnType<
      typeof useChatListContextMenu
    >['openContextMenu']
    activeContextMenuChatId: ReturnType<
      typeof useChatListContextMenu
    >['activeContextMenuChatId']
  }
  style: React.CSSProperties
}>(({ index, data, style }) => {
  const {
    selectedChatId,
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
    activeContextMenuChatId,
  } = data
  const chatId = chatListIds[index]

  return (
    <div style={style}>
      <ChatListItem
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
    </div>
  )
}, areEqual)

export const ChatListItemRowContact = React.memo<{
  index: number
  data: {
    contactCache: {
      [id: number]: Type.Contact | undefined
    }
    contactIds: number[]
    openDialog: OpenDialog
  }
  style: React.CSSProperties
}>(({ index, data, style }) => {
  const { contactCache, contactIds, openDialog } = data
  const contactId = contactIds[index]
  const contact = contactCache[contactId]
  return (
    <div style={style}>
      {contact ? (
        <ContactListItem
          contact={contact}
          showCheckbox={false}
          checked={false}
          showRemove={false}
          onClick={async _ => {
            openViewProfileDialog(openDialog, contactId)
          }}
        />
      ) : (
        <PlaceholderChatListItem />
      )}
    </div>
  )
}, areEqual)

export const ChatListItemRowMessage = React.memo<{
  index: number
  data: {
    messageResultIds: number[]
    messageCache: {
      [id: number]: Type.MessageSearchResult | undefined
    }
    queryStr: string | undefined
  }
  style: React.CSSProperties
}>(({ index, data, style }) => {
  const { messageResultIds, messageCache, queryStr } = data
  const msrId = messageResultIds[index]
  const messageSearchResult = messageCache[msrId]
  return (
    <div style={style}>
      {messageSearchResult ? (
        <ChatListItemMessageResult
          queryStr={queryStr || ''}
          msr={messageSearchResult}
          onClick={() => {
            jumpToMessage(msrId)
          }}
        />
      ) : (
        <div className='pseudo-chat-list-item skeleton' />
      )}
    </div>
  )
}, areEqual)
