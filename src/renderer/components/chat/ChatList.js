import React, { useRef, useEffect, useContext } from 'react'
import ChatListContextMenu from './ChatListContextMenu'
import { useChatListIds, useLazyChatListItems } from './ChatListHelpers'
import ChatListItem from './ChatListItem'
import { PseudoListItemAddContact } from '../helpers/PseudoListItem'
import C from 'deltachat-node/constants'
import { isValidEmail } from '../dialogs/CreateChat'
import ScreenContext from '../../contexts/ScreenContext'
import { callDcMethodAsync } from '../../ipc'

export default function ChatList (props) {
  const { selectedChatId, showArchivedChats, onShowArchivedChats, queryStr } = props
  const queryStrIsEmail = isValidEmail(queryStr)
  const { chatListIds, setQueryStr, setListFlags } = useChatListIds()
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)
  const { changeScreen } = useContext(ScreenContext)
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

  const addContactOnClick = async () => {
    if (!queryStrIsEmail) return

    const contactId = await callDcMethodAsync('contacts.createContact', [queryStr, queryStr])
    const chatId = await callDcMethodAsync('contacts.createChatByContactId', contactId)
    changeScreen('ChatView', { chatId })
  }

  const renderAddContactIfNeeded = () => {
    if (queryStr === '') return null
    if (chatListIds.length > 0 && chatItems[chatListIds[0]] && chatItems[chatListIds[0]].contacts[0].address === queryStr) return null
    return PseudoListItemAddContact({ queryStr, queryStrIsEmail, onClick: addContactOnClick })
  }

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
        {renderAddContactIfNeeded()}
      </div>
      <ChatListContextMenu
        showArchivedChats={showArchivedChats}
        getShow={show => { realOpenContextMenu.current = show }}
      />
    </>
  )
}
