import React, { useRef, useEffect, useState } from 'react'
import ChatListContextMenu from './ChatListContextMenu'
import {
  useChatListIds,
  useLazyChatListItems,
  useMessageResults,
} from './ChatListHelpers'
import ChatListItem, {
  ChatListItemMessageResult,
  PlaceholderChatListItem,
} from './ChatListItem'
import { PseudoListItemAddContact } from '../helpers/PseudoListItem'
import { C } from 'deltachat-node/dist/constants'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { isValidEmail } from '../../../shared/util'
import { ContactListItem } from '../contact/ContactListItem'
import { useContactIds } from '../contact/ContactList'
import {
  ChatListItemType,
  MessageSearchResult,
  DCContact,
} from '../../../shared/shared-types'

const CHATLISTITEM_HEIGHT = 64
const DIVIDER_HEIGHT = 40

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
  const isSearchActive = queryStr !== ''
  const queryStrIsEmail = isValidEmail(queryStr)
  const realOpenContextMenu = useRef(null)

  const {
    cache,
    scrollRef,
    onScroll,
    chatListIds,
    contactIds,
    messageResultIds,
  } = useLogic(queryStr, showArchivedChats)

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return onShowArchivedChats()
    props.onChatClick(chatId)
  }

  const openContextMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    chatId: number
  ) => {
    if (realOpenContextMenu.current === null)
      throw new Error(
        'Tried to open ChatListContextMenu before we recieved open method'
      )
    const chat = cache.chats[chatId]
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
  return (
    <>
      <div className='chat-list' ref={scrollRef} onScroll={onScroll}>
        {isSearchActive && (
          <div className='search-result-divider'>
            {translate_n('n_chats', chatListIds.length)}
          </div>
        )}
        {chatListIds.map(chatId => (
          <ChatListItem
            isSelected={selectedChatId === chatId}
            key={chatId}
            chatListItem={cache.chats[chatId] || undefined}
            onClick={onChatClick.bind(null, chatId)}
            onContextMenu={event => {
              openContextMenu(event, chatId)
            }}
          />
        ))}
        {isSearchActive && (
          <>
            <div className='search-result-divider'>
              {translate_n('n_contacts', contactIds.length)}
            </div>
            {contactIds.map(id => (
              <div key={'c' + id}>
                {cache.contacts[id] ? (
                  <ContactListItem
                    contact={cache.contacts[id]}
                    showCheckbox={false}
                    checked={false}
                    showRemove={false}
                    onClick={async _ => {
                      let chatId = await DeltaBackend.call(
                        'contacts.getChatIdByContactId',
                        id
                      )
                      onChatClick(chatId)
                    }}
                  />
                ) : (
                  <PlaceholderChatListItem />
                )}
              </div>
            ))}
            {chatListIds.length > 0 ||
              PseudoListItemAddContact({
                queryStr,
                queryStrIsEmail,
                onClick: addContactOnClick,
              })}
            <div className='search-result-divider'>
              {translate_n('n_messages', messageResultIds.length)}
            </div>
            {messageResultIds.slice(0, 500).map(id =>
              cache.messages[id] ? (
                <ChatListItemMessageResult
                  msr={cache.messages[id]}
                  onClick={() => {
                    console.log('Clicked on MessageResult with Id', id)
                  }}
                  key={'m' + id}
                />
              ) : (
                <div key={'m' + id} className='chat-list-item skeleton' />
              )
            )}
            {messageResultIds.length > 500 &&
              'message result is trimmed to 500 results for performance'}
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

function whatsInView(
  scrollRef: React.MutableRefObject<HTMLDivElement>,
  isSearchActive: boolean,
  chatListIds: number[],
  contactIds: number[],
  messageResult: number[]
) {
  // find out which items are visible and load them in the cache
  if (!scrollRef.current) {
    return
  }
  const { scrollTop, clientHeight } = scrollRef.current

  const [chatCount, contactCount, messageCount] = [
    chatListIds.length,
    contactIds.length,
    messageResult.length,
  ]

  let chat_ids: number[] = []
  let contact_ids: number[] = []
  let message_ids: number[] = []

  const start_of_chats = isSearchActive ? DIVIDER_HEIGHT : 0
  const end_of_chats = start_of_chats + chatCount * CHATLISTITEM_HEIGHT
  const start_of_contacts = end_of_chats + DIVIDER_HEIGHT
  const end_of_contacts = start_of_contacts + contactCount * CHATLISTITEM_HEIGHT
  const start_of_messages = end_of_contacts + DIVIDER_HEIGHT
  const end_of_messages = start_of_contacts + messageCount * CHATLISTITEM_HEIGHT

  const start_of_view = scrollTop
  const end_of_view = scrollTop + clientHeight

  if (start_of_view < end_of_chats) {
    // find out which chats to fetch
    let indexStart = Math.floor(
      Math.max(start_of_view - start_of_chats, 0) / CHATLISTITEM_HEIGHT
    )
    let indexEnd =
      1 +
      indexStart +
      Math.floor(
        Math.max(Math.min(end_of_chats, end_of_view) - start_of_view, 0) /
          CHATLISTITEM_HEIGHT
      )
    chat_ids = chatListIds.slice(indexStart, indexEnd)
    // console.log('show chats', { indexStart, indexEnd, chat_ids })
  }

  if (
    isSearchActive &&
    start_of_view < end_of_contacts &&
    end_of_view > start_of_contacts
  ) {
    // find out which contacts to fetch
    let indexStart = Math.floor(
      Math.max(start_of_view - start_of_contacts, 0) / CHATLISTITEM_HEIGHT
    )
    let indexEnd =
      1 +
      indexStart +
      Math.floor(
        Math.max(
          Math.min(end_of_contacts, end_of_view) -
            Math.max(start_of_view, start_of_contacts),
          0
        ) / CHATLISTITEM_HEIGHT
      )
    contact_ids = contactIds.slice(indexStart, indexEnd)
    // console.log('show messages', { indexStart, indexEnd })
  }

  if (
    isSearchActive &&
    start_of_view < end_of_messages &&
    end_of_view > start_of_messages
  ) {
    // find out which messages to fetch
    let indexStart = Math.floor(
      Math.max(start_of_view - start_of_messages, 0) / CHATLISTITEM_HEIGHT
    )
    let indexEnd =
      1 +
      indexStart +
      Math.floor(
        Math.max(
          Math.min(end_of_messages, end_of_view) -
            Math.max(start_of_view, start_of_messages),
          0
        ) / CHATLISTITEM_HEIGHT
      )
    message_ids = messageResult.slice(indexStart, indexEnd)
    // console.log('show messages', { indexStart, indexEnd })
  }

  return { chat_ids, contact_ids, message_ids }
}

function useLogic(queryStr: string, showArchivedChats: boolean) {
  const isSearchActive = queryStr !== ''
  const { chatListIds, setQueryStr, setListFlags } = useChatListIds()
  const [contactIds, updateContactSearch] = useContactIds(0, queryStr)
  const [messageResultIds, updateMessageResult] = useMessageResults(queryStr, 0)

  const [cache, setCache] = useState<{
    chats: { [id: number]: ChatListItemType }
    contacts: { [id: number]: DCContact }
    messages: { [id: number]: MessageSearchResult }
  }>({ chats: {}, contacts: {}, messages: {} })

  useEffect(() => {
    setQueryStr(queryStr)
    updateContactSearch(queryStr)
    updateMessageResult(queryStr)
  }, [queryStr])

  const scrollRef = useRef<HTMLDivElement>(null)

  const onScroll = (_event: React.UIEvent<HTMLDivElement>) => {
    const res = whatsInView(
      scrollRef,
      isSearchActive,
      chatListIds,
      contactIds,
      messageResultIds
    )
    // console.log(res)
    // todo fetch
  }

  useEffect(
    () =>
      showArchivedChats
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats]
  )

  return {
    cache,
    scrollRef,
    onScroll,
    chatListIds,
    contactIds,
    messageResultIds,
  }
}
