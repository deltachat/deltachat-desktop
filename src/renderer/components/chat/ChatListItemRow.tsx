import React from 'react'
import ChatListItem, {
  PlaceholderChatListItem,
  ChatListItemMessageResult,
} from './ChatListItem'
import { areEqual } from 'react-window'
import { ContactListItem } from '../contact/ContactListItem'
import { openViewProfileDialog, jumpToMessage } from '../helpers/ChatMethods'

export const ChatListItemRowChat = React.memo<{
  index: number
  data: todo
  style: todo
}>(({ index, data, style }) => {
  const {
    selectedChatId,
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
  } = data
  const [chatId] = chatListIds[index]
  return (
    <div style={style}>
      <ChatListItem
        isSelected={selectedChatId === chatId}
        chatListItem={chatCache[chatId] || undefined}
        onClick={onChatClick.bind(null, chatId)}
        onContextMenu={event => {
          const chat = chatCache[chatId]
          openContextMenu(event, chat, selectedChatId)
        }}
      />
    </div>
  )
}, areEqual)

export const ChatListItemRowContact = React.memo<{
  index: number
  data: todo
  style: todo
}>(({ index, data, style }) => {
  const { contactCache, contactIds, screenContext } = data
  const contactId = contactIds[index]
  return (
    <div style={style}>
      {contactCache[contactId] ? (
        <ContactListItem
          contact={contactCache[contactId]}
          showCheckbox={false}
          checked={false}
          showRemove={false}
          onClick={async _ => {
            openViewProfileDialog(screenContext, contactId)
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
  data: todo
  style: todo
}>(({ index, data, style }) => {
  const { messageResultIds, messageCache, openDialog, queryStr } = data
  const msrId = messageResultIds[index]
  return (
    <div style={style}>
      {messageCache[msrId] ? (
        <ChatListItemMessageResult
          queryStr={queryStr}
          msr={messageCache[msrId]}
          onClick={() => jumpToMessage(messageCache[msrId].id)}
        />
      ) : (
        <div className='pseudo-chat-list-item skeleton' />
      )}
    </div>
  )
}, areEqual)
