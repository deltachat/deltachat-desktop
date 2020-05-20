import React, { useRef, useEffect, useState, Validator } from 'react'
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

import {
  AutoSizer,
  List,
  InfiniteLoader,
  Index,
  WindowScroller,
  IndexRange,
  ListRowRenderer,
} from 'react-virtualized'

const CHATLISTITEM_HEIGHT = 64
const DIVIDER_HEIGHT = 40

const enum LoadStatus {
  FETCHING = 1,
  LOADED = 2,
}

function ChatListPart({
  isRowLoaded,
  loadMoreRows,
  rowCount,
  width,
  children,
}: {
  isRowLoaded: (params: Index) => boolean
  loadMoreRows: (params: IndexRange) => Promise<any>
  rowCount: number
  width: number
  children: ListRowRenderer
}) {
  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={loadMoreRows}
      rowCount={rowCount}
    >
      {({ onRowsRendered, registerChild }) => (
        <List
          ref={registerChild}
          rowHeight={CHATLISTITEM_HEIGHT}
          height={CHATLISTITEM_HEIGHT * rowCount}
          onRowsRendered={onRowsRendered}
          rowRenderer={children}
          rowCount={rowCount}
          width={width}
        />
      )}
    </InfiniteLoader>
  )
}

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

  const { cache, chatListIds, contactIds, messageResultIds } = useLogic(
    queryStr,
    showArchivedChats
  )

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

  // Chat --------------------
  const [chatCache, setChatCache] = useState<{
    [id: number]: ChatListItemType
  }>({})
  const [chatLoadState, setChatLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isChatLoaded: (params: Index) => boolean = ({ index }) =>
    !!chatLoadState[chatListIds[index]]
  const loadChats: (params: IndexRange) => Promise<void> = async ({
    startIndex,
    stopIndex,
  }) => {
    const chatIds = chatListIds.slice(startIndex, stopIndex)
    setChatLoading(state => {
      chatIds.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })
    const chats = await DeltaBackend.call(
      'chatList.getChatListItemsByIds',
      chatIds
    )
    setChatCache(cache => ({ ...cache, ...chats }))
    setChatLoading(state => {
      chatIds.forEach(id => (state[id] = LoadStatus.LOADED))
      return state
    })
  }

  // todo listen for chat change events and react
  // todo fix archived chat link

  // Contacts ----------------
  const [contactCache, setContactCache] = useState<{
    [id: number]: DCContact
  }>({})
  const [contactLoadState, setContactLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isContactLoaded: (params: Index) => boolean = ({ index }) =>
    !!contactLoadState[contactIds[index]]
  const loadContact: (params: IndexRange) => Promise<void> = async ({
    startIndex,
    stopIndex,
  }) => {
    const ids = contactIds.slice(startIndex, stopIndex)
    setContactLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })
    const contacts = await DeltaBackend.call('contacts.getContacts', ids)
    setContactCache(cache => ({ ...cache, ...contacts }))
    setContactLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.LOADED))
      return state
    })
  }

  // Render ------------------
  return (
    <>
      <div className='chat-list'>
        <AutoSizer>
          {({ width }) => (
            <WindowScroller>
              {({ height, isScrolling, registerChild, scrollTop }) => (
                <div>
                  <div ref={registerChild}>
                    {isSearchActive && (
                      <div
                        className='search-result-divider'
                        style={{ width: width }}
                      >
                        {translate_n('n_chats', chatListIds.length)}
                      </div>
                    )}
                    <ChatListPart
                      isRowLoaded={isChatLoaded}
                      loadMoreRows={loadChats}
                      rowCount={chatListIds.length}
                      width={width}
                    >
                      {({ index, key, style }) => {
                        const chatId = chatListIds[index]
                        return (
                          <ChatListItem
                            isSelected={selectedChatId === chatId}
                            key={key}
                            chatListItem={chatCache[chatId] || undefined}
                            onClick={onChatClick.bind(null, chatId)}
                            onContextMenu={event => {
                              openContextMenu(event, chatId)
                            }}
                          />
                        )
                      }}
                    </ChatListPart>
                    {isSearchActive && (
                      <>
                        <div
                          className='search-result-divider'
                          style={{ width: width }}
                        >
                          {translate_n('n_contacts', contactIds.length)}
                        </div>
                        <ChatListPart
                          isRowLoaded={isContactLoaded}
                          loadMoreRows={loadContact}
                          rowCount={contactIds.length}
                          width={width}
                        >
                          {({ index, key, style }) => {
                            const contactId = contactIds[index]
                            return (
                              <div key={key}>
                                {contactCache[contactId] ? (
                                  <ContactListItem
                                    contact={contactCache[contactId]}
                                    showCheckbox={false}
                                    checked={false}
                                    showRemove={false}
                                    onClick={async _ => {
                                      let chatId = await DeltaBackend.call(
                                        'contacts.getChatIdByContactId',
                                        contactId
                                      )
                                      onChatClick(chatId)
                                    }}
                                  />
                                ) : (
                                  <PlaceholderChatListItem />
                                )}
                              </div>
                            )
                          }}
                        </ChatListPart>
                        {chatListIds.length > 0 ||
                          PseudoListItemAddContact({
                            queryStr,
                            queryStrIsEmail,
                            onClick: addContactOnClick,
                          })}
                        <div
                          className='search-result-divider'
                          style={{ width: width }}
                        >
                          {translate_n('n_messages', messageResultIds.length)}
                        </div>
                        {messageResultIds.slice(0, 500).map(id =>
                          cache.messages[id] ? (
                            <ChatListItemMessageResult
                              msr={cache.messages[id]}
                              onClick={() => {
                                console.log(
                                  'Clicked on MessageResult with Id',
                                  id
                                )
                              }}
                              key={'m' + id}
                            />
                          ) : (
                            <div
                              key={'m' + id}
                              className='chat-list-item skeleton'
                            />
                          )
                        )}
                        {messageResultIds.length > 500 &&
                          'message result is trimmed to 500 results for performance'}
                      </>
                    )}
                  </div>
                </div>
              )}
            </WindowScroller>
          )}
        </AutoSizer>
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

  useEffect(
    () =>
      showArchivedChats
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats]
  )

  return {
    cache,
    chatListIds,
    contactIds,
    messageResultIds,
  }
}
