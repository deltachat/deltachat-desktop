import React, { useRef, useEffect } from 'react'
import ChatListContextMenu from './ChatListContextMenu'
import styled from 'styled-components'
import { useChatListIds, useLazyChatListItems, LazyChatListItem } from './helpers/ChatList'

const ChatListWrapper = styled.div`
  width: 30%;
  height: calc(100vh - 50px);
  float: left;
  overflow-y: auto;
  border-right: 1px solid #b9b9b9;
  box-shadow: 0 0 4px 1px rgba(16, 22, 26, 0.1), 0 0 0 rgba(16, 22, 26, 0), 0 1px 1px rgba(16, 22, 26, 0.2);
  user-select: none;
  margin-top: 50px;

  span.module-contact-name {
    font-weight: 200;
    font-size: medium;
  }

  .module-conversation-list-item:hover {
    background-color: ${props => props.theme.chatListItemBgHover}
  }

  .module-conversation-list-item--is-selected {
    background-color: ${props => props.theme.chatListItemSelectedBg};
    color: ${props => props.theme.chatListItemSelectedText};

    span.module-contact-name {
      color: ${props => props.theme.chatListItemSelectedText};
    }

    .module-conversation-list-item__is-group {
      filter: unset;
    }

    &:hover {
        background-color: var(--chatListItemSelectedBg);
    }
  }

  .module-conversation-list-item__header__name {
    width: 90%;
  }

  .status-icon {
    flex-shrink: 0;
    margin-top: 2px;
    margin-left: calc(100% - 90% - 12px);
  }

}
`

const ChatListNoChats = styled.div`
  height: 52px;
  text-align: center;
  padding-top: calc((52px - 14px) / 2);
  padding: 5px;

  p {
    margin: 0 auto;
  }
`

const ContactRequestItemWrapper = styled.div`
  .module-conversation-list-item {
    background-color:#ccc;
  }

  .module-conversation-list-item:hover {
    background-color:#bbb;
  }
`

const ArchivedChats = styled.div`
  .module-conversation-list-item__avatar {
    visibility: hidden;
  }
`

export default function ChatList (props) {
  const { onDeadDropClick, selectedChatId, showArchivedChats, onShowArchivedChats, queryStr } = props
  const { chatListIds, setQueryStr } = useChatListIds()
  const [chatItems, fetchChatsInView, scrollRef] = useLazyChatListItems(chatListIds)
  const realOpenContextMenu = useRef(null)
  const onChatClick = chatId => {
    if (chatId === 6) return onShowArchivedChats()
    props.onChatClick(chatId)    
  }

  useEffect(() => setQueryStr(queryStr), [queryStr])

  const openContextMenu = (event, chatId) => {
    if (realOpenContextMenu.current === null) throw new Error('Tried to open ChatListContextMenu before we recieved open method')
    const chat = chatList.find(chat => chat.id === chatId)
    realOpenContextMenu.current(event, chat)
  }

  const tx = window.translate
  const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')

  return (
    <>
      <ChatListWrapper ref={scrollRef} onScroll={fetchChatsInView}>
        { !chatListIds.length && (<ChatListNoChats><p>{missingChatsMsg}</p></ChatListNoChats>) }
        <div className='ConversationList'>
          {chatListIds.map(chatId => <LazyChatListItem
            isSelected={selectedChatId === chatId}
            key={chatId}
            chatListItem={chatItems[chatId]}
            onClick={onChatClick.bind(null, chatId)}
          />)}
          {chatListIds.length === 0 && queryStr !== '' && PseudoContactListItemNoSearchResults({ queryStr })}
        </div>
      </ChatListWrapper>
      <ChatListContextMenu
        showArchivedChats={showArchivedChats}
        getShow={show => { realOpenContextMenu.current = show }}
      />
    </>
  )
}
