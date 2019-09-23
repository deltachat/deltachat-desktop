import React, { useRef, useEffect } from 'react'
import ChatListContextMenu from './ChatListContextMenu'
import { useChatListIds, useLazyChatListItems } from './helpers/ChatList'
import ChatListItem from './helpers/ChatListItem'
import { PseudoContactListItemNoSearchResults } from './helpers/ContactListItem'
const C = require('deltachat-node/constants')

export default function ChatList (props) {
  const { onDeadDropClick, selectedChatId, showArchivedChats, onShowArchivedChats, queryStr } = props
  const { chatListIds, setQueryStr, setListFlags } = useChatListIds()
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)
  const realOpenContextMenu = useRef(null)
  const onChatClick = chatId => {
    if (chatId === 6) return onShowArchivedChats()
    props.onChatClick(chatId)
  }

  useEffect(() => setQueryStr(queryStr), [queryStr])
  useEffect(() => showArchivedChats ? setListFlags(C.DC_GCL_ARCHIVED_ONLY) : setListFlags(0), [showArchivedChats])

  const openContextMenu = (event, chatId) => {
    if (realOpenContextMenu.current === null) throw new Error('Tried to open ChatListContextMenu before we recieved open method')
    const chat = chatItems[chatId]
    realOpenContextMenu.current(event, chat)
  }

  const tx = window.translate
  const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')

  return (
    <>
      <div className='chat-list' ref={scrollRef} onScroll={onChatListScroll}>
        {chatListIds.map(chatId => {
          return (
            <ChatListItem
              isSelected={selectedChatId === chatId}
              key={chatId}
              chatListItem={chatItems[chatId]}
              onClick={onChatClick.bind(null, chatId)}
              onContextMenu={(event) => { openContextMenu(event, chatId) }}
            />
          )
        })}
        {chatListIds.length === 0 && queryStr === '' &&
         null
        }
        { chatListIds.length === 0 && queryStr !== '' &&
          PseudoContactListItemNoSearchResults({ queryStr })
        }
      </div>
      <ChatListContextMenu
        showArchivedChats={showArchivedChats}
        getShow={show => { realOpenContextMenu.current = show }}
      />
    </>
  )
}
