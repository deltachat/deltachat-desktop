import React, { useRef, useEffect, useState, useContext } from 'react'
import { useChatListContextMenu } from './ChatListContextMenu'
import { useMessageResults, useChatList } from './ChatListHelpers'
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
  IndexRange,
  ListRowRenderer,
} from 'react-virtualized'
import { ipcBackend } from '../../ipc'
import { ScreenContext } from '../../contexts'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/chatlist')

const CHATLISTITEM_HEIGHT = 64
const DIVIDER_HEIGHT = 40

const enum LoadStatus {
  FETCHING = 1,
  LOADED = 2,
}

export function ChatListPart({
  isRowLoaded,
  loadMoreRows,
  rowCount,
  width,
  children,
  height,
  scrollToIndex,
}: {
  isRowLoaded: (params: Index) => boolean
  loadMoreRows: (params: IndexRange) => Promise<any>
  rowCount: number
  width: number
  children: ListRowRenderer
  height: number
  scrollToIndex?: number
}) {
  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={loadMoreRows}
      rowCount={rowCount}
      minimumBatchSize={1}
    >
      {({ onRowsRendered, registerChild }) => (
        <List
          ref={registerChild}
          rowHeight={CHATLISTITEM_HEIGHT}
          height={height}
          onRowsRendered={onRowsRendered}
          rowRenderer={children}
          rowCount={rowCount}
          width={width}
          scrollToIndex={scrollToIndex}
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

  const {
    contactIds,
    messageResultIds,
    isMessageLoaded,
    loadMessages,
    messageCache,
    isContactLoaded,
    loadContact,
    contactCache,
  } = useContactAndMessageLogic(queryStr)

  const { chatListIds, isChatLoaded, loadChats, chatCache } = useLogicChatPart(
    queryStr,
    showArchivedChats
  )

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return onShowArchivedChats()
    props.onChatClick(chatId)
  }

  const openContextMenu = useChatListContextMenu()

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
  const screenContext = useContext(ScreenContext)
  const { openDialog } = screenContext

  // divider height ------------

  const chatsHeight = (height: number) =>
    isSearchActive
      ? Math.min(
          height / 3 - DIVIDER_HEIGHT,
          chatListIds.length * CHATLISTITEM_HEIGHT
        )
      : height

  const contactsHeight = (height: number) =>
    Math.min(
      height / 3 - DIVIDER_HEIGHT,
      contactIds.length * CHATLISTITEM_HEIGHT
    )

  const messagesHeight = (height: number) =>
    height -
    (DIVIDER_HEIGHT * 3 +
      chatsHeight(height) +
      contactsHeight(height) +
      (chatListIds.length == 0 ? CHATLISTITEM_HEIGHT : 0))

  // scroll to selected chat ---
  const [scrollToChatIndex, setScrollToChatIndex] = useState<number>(-1)

  const scrollSelectedChatIntoView = () => {
    const index = chatListIds.findIndex(
      ([chatId, _messageId]) => chatId === selectedChatId
    )
    if (index !== -1) {
      setScrollToChatIndex(index)
      setTimeout(() => setScrollToChatIndex(-1), 0)
    }
  }
  // on select chat - scroll to selected chat - chatView
  useEffect(() => {
    scrollSelectedChatIntoView()
  }, [selectedChatId])
  // follow chat after loading or when it's position in the chatlist changes
  const selectedChatIndex = chatListIds.findIndex(
    ([chatId, _messageId]) => chatId === selectedChatId
  )
  useEffect(() => {
    !isSearchActive && scrollSelectedChatIntoView()
  }, [selectedChatIndex])

  const selectFirstChat = () => selectChat(chatListIds[0][0])

  // KeyboardShortcuts ---------
  useKeyBindingAction(KeybindAction.ChatList_ScrollToSelectedChat, () =>
    scrollSelectedChatIntoView()
  )

  useKeyBindingAction(KeybindAction.ChatList_SelectNextChat, () => {
    if (selectedChatId === null) return selectFirstChat()
    const selectedChatIndex = chatListIds.findIndex(
      ([chatId, _messageId]) => chatId === selectedChatId
    )
    const [newChatId, _] = chatListIds[selectedChatIndex + 1] || []
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_SelectPreviousChat, () => {
    if (selectedChatId === null) return selectFirstChat()
    const selectedChatIndex = chatListIds.findIndex(
      ([chatId, _messageId]) => chatId === selectedChatId
    )
    const [newChatId, _] = chatListIds[selectedChatIndex - 1] || []
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_SelectFirstChat, () =>
    selectFirstChat()
  )

  // Render --------------------
  return (
    <>
      <div className='chat-list'>
        <AutoSizer>
          {({ width, height }) => (
            <div>
              {isSearchActive && (
                <div className='search-result-divider' style={{ width: width }}>
                  {translate_n('n_chats', chatListIds.length)}
                </div>
              )}
              <ChatListPart
                isRowLoaded={isChatLoaded}
                loadMoreRows={loadChats}
                rowCount={chatListIds.length}
                width={width}
                height={chatsHeight(height)}
                scrollToIndex={scrollToChatIndex}
              >
                {({ index, key, style }) => {
                  const [chatId] = chatListIds[index]
                  return (
                    <div style={style} key={key}>
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
                    height={contactsHeight(height)}
                  >
                    {({ index, key, style }) => {
                      const contactId = contactIds[index]
                      return (
                        <div key={key} style={style}>
                          {contactCache[contactId] ? (
                            <ContactListItem
                              contact={contactCache[contactId]}
                              showCheckbox={false}
                              checked={false}
                              showRemove={false}
                              onClick={async _ => {
                                let chatId = await DeltaBackend.call(
                                  'contacts.getDMChatId',
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
                  {chatListIds.length === 0 && queryStrIsEmail && (
                    <div style={{ width: '30vw' }}>
                      <PseudoListItemAddContact
                        queryStr={queryStr}
                        queryStrIsEmail={queryStrIsEmail}
                        onClick={addContactOnClick}
                      />
                    </div>
                  )}
                  <div
                    className='search-result-divider'
                    style={{ width: width }}
                  >
                    {translate_n('n_messages', messageResultIds.length)}
                  </div>

                  <ChatListPart
                    isRowLoaded={isMessageLoaded}
                    loadMoreRows={loadMessages}
                    rowCount={messageResultIds.length}
                    width={width}
                    height={
                      // take remaining space
                      messagesHeight(height)
                    }
                  >
                    {({ index, key, style }) => {
                      const msrId = messageResultIds[index]
                      return (
                        <div style={style} key={key}>
                          {messageCache[msrId] ? (
                            <ChatListItemMessageResult
                              queryStr={queryStr}
                              msr={messageCache[msrId]}
                              onClick={() => {
                                openDialog('MessageDetail', {
                                  id: msrId,
                                })
                              }}
                            />
                          ) : (
                            <div className='pseudo-chat-list-item skeleton' />
                          )}
                        </div>
                      )
                    }}
                  </ChatListPart>
                </>
              )}
            </div>
          )}
        </AutoSizer>
      </div>
    </>
  )
}

function translate_n(key: string, quantity: number) {
  return window
    .static_translate(key, String(quantity), { quantity })
    .toUpperCase()
}

/** functions for the chat virtual list */
export function useLogicVirtualChatList(chatListIds: [number, number][]) {
  // workaround to save a current reference of chatListIds
  const chatListIdsRef = useRef(chatListIds)
  if (chatListIdsRef.current !== chatListIds) {
    // this is simmilar to a use hook doing this, but probably less expensive
    chatListIdsRef.current = chatListIds
  }
  // end workaround

  const [chatCache, setChatCache] = useState<{
    [id: number]: ChatListItemType
  }>({})
  const [chatLoadState, setChatLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isChatLoaded: (params: Index) => boolean = ({ index }) =>
    !!chatLoadState[chatListIds[index][0]]
  const loadChats: (params: IndexRange) => Promise<void> = async ({
    startIndex,
    stopIndex,
  }) => {
    const entries = chatListIds.slice(startIndex, stopIndex + 1)
    setChatLoading(state => {
      entries.forEach(
        ([chatId, _msgId]) => (state[chatId] = LoadStatus.FETCHING)
      )
      return state
    })
    const chats = await DeltaBackend.call(
      'chatList.getChatListItemsByEntries',
      entries
    )
    setChatCache(cache => ({ ...cache, ...chats }))
    setChatLoading(state => {
      entries.forEach(([chatId, _msgId]) => (state[chatId] = LoadStatus.LOADED))
      return state
    })
  }

  const onChatListItemChanged = (
    _event: any,
    [chatId, messageId]: [number, number]
  ) => {
    const updateChatListItem = async (chatId: number, messageId: number) => {
      setChatLoading(state => ({
        ...state,
        [chatId]: LoadStatus.FETCHING,
      }))
      const chats = await DeltaBackend.call(
        'chatList.getChatListItemsByEntries',
        [[chatId, messageId]]
      )
      setChatCache(cache => ({ ...cache, ...chats }))
      setChatLoading(state => ({
        ...state,
        [chatId]: LoadStatus.LOADED,
      }))
    }
    if (chatId === 0) {
      // setChatLoading({})
      // setChatCache({})
    } else {
      if (messageId === 0) {
        // if no message id is provided it tries to take the old one
        // workaround to get msgId
        const cachedChat = chatListIdsRef.current?.find(
          ([cId, _messageId]) => cId === chatId
        )
        // check if workaround worked
        if (cachedChat) {
          updateChatListItem(chatId, cachedChat[1])
        } else {
          log.warn(
            'onChatListItemChanged triggered, but no message id was provided nor found in the cache'
          )
        }
      } else {
        updateChatListItem(chatId, messageId)
      }
    }
  }
  useEffect(() => {
    ipcBackend.on('DC_EVENT_MSG_READ', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSG_DELIVERED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSG_FAILED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_CHAT_MODIFIED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSGS_CHANGED', onChatListItemChanged)

    return () => {
      ipcBackend.removeListener('DC_EVENT_MSG_READ', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSG_DELIVERED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSG_FAILED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_CHAT_MODIFIED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_INCOMING_MSG', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSGS_CHANGED', onChatListItemChanged)
    }
  }, [])

  // effects

  useEffect(() => {
    // force refresh of inital data
    loadChats({ startIndex: 0, stopIndex: Math.min(chatListIds.length, 10) })
  }, [chatListIds])

  return { isChatLoaded, loadChats, chatCache }
}

function useLogicChatPart(queryStr: string, showArchivedChats: boolean) {
  const { chatListIds, setQueryStr, setListFlags } = useChatList()
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds
  )

  // effects
  useEffect(() => {
    setQueryStr(queryStr)
  }, [queryStr])

  useEffect(
    () =>
      showArchivedChats
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats]
  )

  return { chatListIds, isChatLoaded, loadChats, chatCache }
}

function useContactAndMessageLogic(queryStr: string) {
  const [contactIds, updateContactSearch] = useContactIds(0, queryStr)
  const [messageResultIds, updateMessageResult] = useMessageResults(queryStr, 0)

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
    const ids = contactIds.slice(startIndex, stopIndex + 1)

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

  // Message ----------------
  const [messageCache, setMessageCache] = useState<{
    [id: number]: MessageSearchResult
  }>({})
  const [messageLoadState, setMessageLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isMessageLoaded: (params: Index) => boolean = ({ index }) =>
    !!messageLoadState[messageResultIds[index]]
  const loadMessages: (params: IndexRange) => Promise<void> = async ({
    startIndex,
    stopIndex,
  }) => {
    const ids = messageResultIds.slice(startIndex, stopIndex + 1)

    setMessageLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })
    const messages = await DeltaBackend.call(
      'messageList.msgIds2SearchResultItems',
      ids
    )
    setMessageCache(cache => ({ ...cache, ...messages }))
    setMessageLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.LOADED))
      return state
    })
  }

  // effects
  useEffect(() => {
    updateContactSearch(queryStr)
    updateMessageResult(queryStr)
  }, [queryStr])

  useEffect(() => {
    // force refresh of inital data
    loadContact({ startIndex: 0, stopIndex: Math.min(contactIds.length, 10) })
    loadMessages({
      startIndex: 0,
      stopIndex: Math.min(messageResultIds.length, 10),
    })
  }, [contactIds, messageResultIds])

  return {
    // contacts
    contactIds,
    isContactLoaded,
    loadContact,
    contactCache,
    // messages
    messageResultIds,
    isMessageLoaded,
    loadMessages,
    messageCache,
  }
}
