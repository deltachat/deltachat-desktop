import React, { useRef, useEffect, useState } from 'react'
import ChatListContextMenu from './ChatListContextMenu'
import {
  useChatListIds,
  useLazyChatListItems,
  useMessageResults,
} from './ChatListHelpers'
import ChatListItem from './ChatListItem'
import { PseudoListItemAddContact } from '../helpers/PseudoListItem'
import { C } from 'deltachat-node/dist/constants'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { isValidEmail } from '../../../shared/util'
import { ContactListItem } from '../contact/ContactListItem'
import { useContacts } from '../contact/ContactList'

export default function ChatList(props: {
  selectedChatId: number
  showArchivedChats: boolean
  onShowArchivedChats: () => void
  queryStr?: string
  onChatClick: (chatId: number) => void
}) {
  const {
    selectedChatId,
    showArchivedChats,
    onShowArchivedChats,
    queryStr,
  } = props
  const queryStrIsEmail = isValidEmail(queryStr)
  const { chatListIds, setQueryStr, setListFlags } = useChatListIds()
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(
    chatListIds
  )
  const realOpenContextMenu = useRef(null)

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return onShowArchivedChats()
    props.onChatClick(chatId)
  }

  useEffect(() => setQueryStr(queryStr), [queryStr])
  useEffect(
    () =>
      showArchivedChats
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats]
  )

  const openContextMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    chatId: number
  ) => {
    if (realOpenContextMenu.current === null)
      throw new Error(
        'Tried to open ChatListContextMenu before we recieved open method'
      )
    const chat = chatItems[chatId]
    realOpenContextMenu.current(event, chat)
  }

  const addContactOnClick = async () => {
    if (!queryStrIsEmail) return

    const contactId = await DeltaBackend.call(
      'contacts.createContact',
      queryStr
    )
    const chatId = await DeltaBackend.call(
      'contacts.createChatByContactId',
      contactId
    )
    selectChat(chatId)
  }

  const isSearchActive = queryStr !== ''

  const [contacts, updateContactSearch] = useContacts(0, queryStr)
  const [messageResult, updateMessageResult] = useMessageResults(queryStr, 0)
  useEffect(() => {
    updateContactSearch(queryStr)
    updateMessageResult(queryStr)
  }, [queryStr])

  return (
    <>
      <div className='chat-list' ref={scrollRef} onScroll={onChatListScroll}>
        {isSearchActive && (
          <div className='search-result-divider'>
            {translate_n('n_chats', chatListIds.length)}
          </div>
        )}
        {chatListIds.map(chatId => {
          return (
            <ChatListItem
              isSelected={selectedChatId === chatId}
              key={chatId}
              chatListItem={chatItems[chatId]}
              onClick={onChatClick.bind(null, chatId)}
              onContextMenu={event => {
                openContextMenu(event, chatId)
              }}
            />
          )
        })}
        {isSearchActive && (
          <>
            <div className='search-result-divider'>
              {translate_n('n_contacts', contacts.length)}
            </div>
            {contacts.map(contact => (
              <ContactListItem
                contact={contact}
                showCheckbox={false}
                checked={false}
                showRemove={false}
                onClick={async _ => {
                  let chatId = await DeltaBackend.call(
                    'contacts.getChatIdByContactId',
                    contact.id
                  )
                  onChatClick(chatId)
                }}
                key={contact.id}
              />
            ))}
            {chatListIds.length > 0 ||
              PseudoListItemAddContact({
                queryStr,
                queryStrIsEmail,
                onClick: addContactOnClick,
              })}
            <div className='search-result-divider'>
              {translate_n('n_messages', messageResult.length)}
            </div>
            {JSON.stringify(messageResult)}
          </>
        )}
      </div>
      <ChatListContextMenu
        showArchivedChats={showArchivedChats}
        getShow={show => {
          realOpenContextMenu.current = show
        }}
      />
    </>
  )
}

function translate_n(key: string, quantity: number) {
  return window.translate(key, String(quantity), { quantity }).toUpperCase()
}
