import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ComponentType,
  useMemo,
} from 'react'
import {
  FixedSizeList as List,
  ListChildComponentProps,
  ListItemKeySelector,
} from 'react-window'
import { C, T } from '@deltachat/jsonrpc-client'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'

import { useLazyLoadedContacts } from '../contact/ContactList'
import { useChatListContextMenu } from './ChatListContextMenu'
import { useMessageResults, useChatList } from './ChatListHelpers'
import {
  ChatListItemRowChat,
  ChatListItemRowContact,
  ChatListItemRowMessage,
} from './ChatListItemRow'
import { PseudoListItemAddContact } from '../helpers/PseudoListItem'
import { KeybindAction } from '../../keybindings'
import { useThemeCssVar } from '../../ThemeManager'
import { BackendRemote, onDCEvent, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import CreateChat from '../dialogs/CreateChat'
import useChat from '../../hooks/chat/useChat'
import useCreateChatByContactId from '../../hooks/chat/useCreateChatByContactId'
import useDialog from '../../hooks/dialog/useDialog'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type {
  ChatListItemData,
  ContactChatListItemData,
  MessageChatListItemData,
} from './ChatListItemRow'

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
  itemKey,
  setListRef,
  itemData,
  itemHeight,
}: {
  isRowLoaded: (index: number) => boolean
  loadMoreRows: (startIndex: number, stopIndex: number) => Promise<any>
  rowCount: number
  width: number
  children: ComponentType<ListChildComponentProps<any>>
  height: number
  itemKey: ListItemKeySelector<any>
  setListRef?: (ref: List<any> | null) => void
  itemData?:
    | ChatListItemData
    | ContactChatListItemData
    | MessageChatListItemData
  itemHeight: number
}) {
  const infiniteLoaderRef = useRef<InfiniteLoader | null>(null)

  // By default InfiniteLoader assumes that each item's index in the list
  // never changes. But in our case they do change because of filtering.
  // This code ensures that the currently displayed items get loaded
  // even if the scroll position didn't change.
  // Relevant issues:
  // - https://github.com/deltachat/deltachat-desktop/issues/3921
  // - https://github.com/deltachat/deltachat-desktop/issues/3208
  useEffect(() => {
    infiniteLoaderRef.current?.resetloadMoreItemsCache(true)
    // We could specify `useEffect`'s dependencies (the major one being
    // `rowCount`) for some performance, but it's not enough
    // because items could change with `rowCount` being the same,
    // e.g. when you archive a chat for the first time.
    // So let's play it safe.
  })

  return (
    <InfiniteLoader
      isItemLoaded={isRowLoaded}
      itemCount={rowCount}
      loadMoreItems={loadMoreRows}
      ref={infiniteLoaderRef}
    >
      {({ onItemsRendered, ref }) => (
        <List
          className=''
          height={height}
          itemCount={rowCount}
          itemSize={itemHeight}
          onItemsRendered={onItemsRendered}
          ref={r => {
            ;(ref as any)(r)
            setListRef && setListRef(r)
          }}
          width={width}
          itemKey={itemKey}
          itemData={itemData}
        >
          {children}
        </List>
      )}
    </InfiniteLoader>
  )
}

export default function ChatList(props: {
  selectedChatId: number | null
  showArchivedChats: boolean
  queryStr?: string
  queryChatId: number | null
  onExitSearch?: () => void
  onChatClick: (chatId: number) => void
}) {
  const accountId = selectedAccountId()

  const {
    selectedChatId,
    showArchivedChats,
    onChatClick,
    queryStr,
    queryChatId,
  } = props
  const isSearchActive = queryStr !== ''

  const {
    contactIds,
    messageResultIds,
    isMessageLoaded,
    loadMessages,
    messageCache,
    isContactLoaded,
    loadContact,
    contactCache,
    queryStrIsValidEmail,
  } = useContactAndMessageLogic(queryStr, queryChatId)

  const { chatListIds, isChatLoaded, loadChats, chatCache } = useLogicChatPart(
    queryStr,
    showArchivedChats
  )

  const { openContextMenu, activeContextMenuChatId } = useChatListContextMenu()
  const createChatByContactId = useCreateChatByContactId()
  const { selectChat } = useChat()

  const addContactOnClick = async () => {
    if (!queryStrIsValidEmail || !queryStr) return

    const contactId = await BackendRemote.rpc.createContact(
      selectedAccountId(),
      queryStr.trim(),
      null
    )
    await createChatByContactId(accountId, contactId)
    props.onExitSearch && props.onExitSearch()
  }
  const { openDialog } = useDialog()

  const onCreateChat = () => {
    openDialog(CreateChat)
  }

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64
  const CHATLISTITEM_CONTACT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-contact-height')) || 64
  const CHATLISTITEM_MESSAGE_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-message-height')) || 72
  const DIVIDER_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-divider-height')) || 40

  // divider height ------------

  const chatsHeight = (height: number) =>
    isSearchActive
      ? Math.min(
          height / 3 - DIVIDER_HEIGHT,
          chatListIds.length * CHATLISTITEM_CHAT_HEIGHT
        )
      : height

  const contactsHeight = (height: number) =>
    Math.min(
      height / 3 - DIVIDER_HEIGHT,
      contactIds.length * CHATLISTITEM_CONTACT_HEIGHT
    )

  const messagesHeight = (height: number) =>
    height -
    (DIVIDER_HEIGHT * 3 +
      chatsHeight(height) +
      contactsHeight(height) +
      (chatListIds.length == 0 && queryStrIsValidEmail
        ? CHATLISTITEM_MESSAGE_HEIGHT
        : 0))

  // scroll to selected chat ---
  const listRefRef = useRef<List<any>>(null)
  const selectedChatIndex = chatListIds.findIndex(
    chatId => chatId === selectedChatId
  )

  const scrollSelectedChatIntoView = useCallback((index: number) => {
    if (index !== -1) {
      listRefRef.current?.scrollToItem(index)
    }
  }, [])

  const lastShowArchivedChatsState = useRef(showArchivedChats)
  // on select chat - scroll to selected chat - chatView
  // follow chat after loading or when it's position in the chatlist changes
  useEffect(() => {
    if (isSearchActive) {
      scrollSelectedChatIntoView(0)
      // search is active, don't scroll
      return
    }
    // when showArchivedChats changes, select selected chat if it is archived/not-archived otherwise select first item
    if (selectedChatIndex !== -1) {
      scrollSelectedChatIntoView(selectedChatIndex)
    } else {
      if (lastShowArchivedChatsState.current !== showArchivedChats) {
        scrollSelectedChatIntoView(0)
      }
    }
    lastShowArchivedChatsState.current = showArchivedChats
  }, [
    selectedChatIndex,
    isSearchActive,
    scrollSelectedChatIntoView,
    showArchivedChats,
  ])

  const selectFirstChat = () => selectChat(accountId, chatListIds[0])

  // KeyboardShortcuts ---------
  useKeyBindingAction(KeybindAction.ChatList_ScrollToSelectedChat, () =>
    scrollSelectedChatIntoView(selectedChatIndex)
  )

  useKeyBindingAction(KeybindAction.ChatList_SelectNextChat, () => {
    if (selectedChatId === null) return selectFirstChat()
    const selectedChatIndex = chatListIds.findIndex(
      chatId => chatId === selectedChatId
    )
    const newChatId = chatListIds[selectedChatIndex + 1]
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(accountId, newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_SelectPreviousChat, () => {
    if (selectedChatId === null) return selectFirstChat()
    const selectedChatIndex = chatListIds.findIndex(
      chatId => chatId === selectedChatId
    )
    const newChatId = chatListIds[selectedChatIndex - 1]
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(accountId, newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_SelectFirstChat, () =>
    selectFirstChat()
  )

  const chatlistData = useMemo(() => {
    return {
      selectedChatId,
      chatListIds,
      chatCache,
      onChatClick,
      openContextMenu,
      activeContextMenuChatId,
    }
  }, [
    selectedChatId,
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
    activeContextMenuChatId,
  ])

  const contactlistData: {
    contactCache: {
      [id: number]: Type.Contact | undefined
    }
    contactIds: number[]
  } = useMemo(() => {
    return {
      contactCache,
      contactIds,
    }
  }, [contactCache, contactIds])

  const messagelistData = useMemo(() => {
    return { messageResultIds, messageCache, queryStr }
  }, [messageResultIds, messageCache, queryStr])

  const [searchChatInfo, setSearchChatInfo] = useState<T.FullChat | null>(null)
  useEffect(() => {
    if (queryChatId) {
      BackendRemote.rpc
        .getFullChatById(accountId, queryChatId)
        .then(setSearchChatInfo)
        .catch(console.error)
    } else {
      setSearchChatInfo(null)
    }
  }, [accountId, queryChatId, isSearchActive])

  // Render --------------------
  const tx = useTranslationFunction()

  if (queryChatId && searchChatInfo) {
    return (
      <>
        <div className='chat-list'>
          <AutoSizer>
            {({ width, height }) => (
              <div>
                <div className='search-result-divider' style={{ width: width }}>
                  {tx('search_in', searchChatInfo.name)}
                  {messageResultIds.length !== 0 &&
                    ': ' + translate_n('n_messages', messageResultIds.length)}
                </div>
                <ChatListPart
                  isRowLoaded={isMessageLoaded}
                  loadMoreRows={loadMessages}
                  rowCount={messageResultIds.length}
                  width={width}
                  height={
                    /* take remaining space */
                    height - DIVIDER_HEIGHT
                  }
                  itemKey={index => 'key' + messageResultIds[index]}
                  itemData={messagelistData}
                  itemHeight={CHATLISTITEM_MESSAGE_HEIGHT}
                >
                  {ChatListItemRowMessage}
                </ChatListPart>
              </div>
            )}
          </AutoSizer>
        </div>
      </>
    )
  }

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
                setListRef={(ref: List<any> | null) =>
                  ((listRefRef.current as any) = ref)
                }
                itemKey={index => 'key' + chatListIds[index]}
                itemData={chatlistData}
                itemHeight={CHATLISTITEM_CHAT_HEIGHT}
              >
                {ChatListItemRowChat}
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
                    itemKey={index => 'key' + contactIds[index]}
                    itemData={contactlistData}
                    itemHeight={CHATLISTITEM_CONTACT_HEIGHT}
                  >
                    {ChatListItemRowContact}
                  </ChatListPart>
                  {contactIds.length === 0 &&
                    chatListIds.length === 0 &&
                    queryStrIsValidEmail && (
                      <div style={{ width: width }}>
                        <PseudoListItemAddContact
                          queryStr={queryStr?.trim() || ''}
                          queryStrIsEmail={queryStrIsValidEmail}
                          onClick={addContactOnClick}
                        />
                      </div>
                    )}
                  <div
                    className='search-result-divider'
                    style={{ width: width }}
                  >
                    {translated_messages_label(messageResultIds.length)}
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
                    itemKey={index => 'key' + messageResultIds[index]}
                    itemData={messagelistData}
                    itemHeight={CHATLISTITEM_MESSAGE_HEIGHT}
                  >
                    {ChatListItemRowMessage}
                  </ChatListPart>
                </>
              )}
              <div
                className='floating-action-button'
                onClick={onCreateChat}
                id='new-chat-button'
              >
                <div
                  className='Icon'
                  style={{
                    WebkitMask:
                      'url(../images/icons/plus.svg) no-repeat center',
                  }}
                ></div>
              </div>
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
export function useLogicVirtualChatList(chatListIds: number[]) {
  const accountId = selectedAccountId()
  // workaround to save a current reference of chatListIds
  const chatListIdsRef = useRef(chatListIds)
  if (chatListIdsRef.current !== chatListIds) {
    // this is similar to a use hook doing this, but probably less expensive
    chatListIdsRef.current = chatListIds
  }
  // end workaround

  const [chatCache, setChatCache] = useState<{
    [id: number]: Type.ChatListItemFetchResult | undefined
  }>({})
  /** reference to newest chat cache for use in useEffect functions that listen for events */
  const chatCacheRef = useRef<typeof chatCache>({})
  chatCacheRef.current = chatCache

  const [chatLoadState, setChatLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isChatLoaded: (index: number) => boolean = index =>
    !!chatLoadState[chatListIds[index]]
  const loadChats: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void> = async (startIndex, stopIndex) => {
    const entries = chatListIds.slice(startIndex, stopIndex + 1)
    setChatLoading(state => {
      entries.forEach(chatId => (state[chatId] = LoadStatus.FETCHING))
      return state
    })
    const chats = await BackendRemote.rpc.getChatlistItemsByEntries(
      accountId,
      entries
    )
    setChatCache(cache => ({ ...cache, ...chats }))
    setChatLoading(state => {
      entries.forEach(chatId => (state[chatId] = LoadStatus.LOADED))
      return state
    })
  }

  useEffect(() => {
    let debouncingChatlistItemRequests: { [chatid: number]: number } = {}
    const cleanup_interval = setInterval(() => {
      // clean up debouncingChatlistItemRequests every half minute,
      // so if there should ever be an error it auto recovers
      debouncingChatlistItemRequests = {}
    }, 30000)

    const updateChatListItem = async (chatId: number) => {
      debouncingChatlistItemRequests[chatId] = 1
      setChatLoading(state => ({
        ...state,
        [chatId]: LoadStatus.FETCHING,
      }))
      const chats = await BackendRemote.rpc.getChatlistItemsByEntries(
        accountId,
        [chatId]
      )
      setChatCache(cache => ({ ...cache, ...chats }))
      setChatLoading(state => ({
        ...state,
        [chatId]: LoadStatus.LOADED,
      }))
      if (debouncingChatlistItemRequests[chatId] > 1) {
        updateChatListItem(chatId)
      } else {
        debouncingChatlistItemRequests[chatId] = 0
      }
    }

    const removeListener = onDCEvent(
      accountId,
      'ChatlistItemChanged',
      async ({ chatId }) => {
        if (chatId === C.DC_CHAT_ID_TRASH) {
          return
        }
        if (chatId !== null) {
          if (
            debouncingChatlistItemRequests[chatId] === undefined ||
            debouncingChatlistItemRequests[chatId] === 0
          ) {
            updateChatListItem(chatId)
          } else {
            debouncingChatlistItemRequests[chatId] =
              debouncingChatlistItemRequests[chatId] + 1
          }
        } else {
          // invalidate whole chatlist cache and reload everyhting that was visible before
          const cached_items = Object.keys(chatCacheRef.current || {}).map(
            Number
          )
          const possibly_visible = cached_items.filter(
            chatId => chatListIdsRef.current.indexOf(chatId) !== -1
          )
          setChatCache({})
          const new_loading: { [id: number]: LoadStatus | undefined } = {}
          possibly_visible.forEach(
            chatId => (new_loading[chatId] = LoadStatus.FETCHING)
          )
          setChatLoading(new_loading)
          const chats = await BackendRemote.rpc.getChatlistItemsByEntries(
            accountId,
            possibly_visible
          )
          setChatCache(cache => ({ ...cache, ...chats }))
          const new_done: { [id: number]: LoadStatus | undefined } = {}
          possibly_visible.forEach(
            chatId => (new_done[chatId] = LoadStatus.LOADED)
          )
          setChatLoading(state => ({
            ...state,
            ...new_done,
          }))
          // reset debouncing
          debouncingChatlistItemRequests = {}
        }
      }
    )
    return () => {
      removeListener()
      clearInterval(cleanup_interval)
    }
  }, [accountId])

  return { isChatLoaded, loadChats, chatCache }
}

function useLogicChatPart(
  queryStr: string | undefined,
  showArchivedChats: boolean
) {
  const { chatListIds, setQueryStr, setListFlags } = useChatList()
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

  // effects
  useEffect(() => {
    setQueryStr(queryStr)
  }, [queryStr, setQueryStr])

  useEffect(
    () =>
      showArchivedChats && queryStr?.length === 0
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats, queryStr, setListFlags]
  )

  return { chatListIds, isChatLoaded, loadChats, chatCache }
}

function useContactAndMessageLogic(
  queryStr: string | undefined,
  searchChatId: number | null = null
) {
  const accountId = selectedAccountId()
  const messageResultIds = useMessageResults(queryStr, searchChatId)

  // Contacts ----------------
  const {
    contactIds,
    contactCache,
    loadContacts: loadContact,
    isContactLoaded,
    queryStrIsValidEmail,
  } = useLazyLoadedContacts(0, queryStr)

  // Message ----------------
  const [messageCache, setMessageCache] = useState<{
    [id: number]: T.MessageSearchResult | undefined
  }>({})
  const [messageLoadState, setMessageLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isMessageLoaded: (index: number) => boolean = index =>
    !!messageLoadState[messageResultIds[index]]
  const loadMessages: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void> = async (startIndex, stopIndex) => {
    const ids = messageResultIds.slice(startIndex, stopIndex + 1)

    setMessageLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })
    const messages = await BackendRemote.rpc.messageIdsToSearchResults(
      accountId,
      ids
    )
    setMessageCache(cache => ({ ...cache, ...messages }))
    setMessageLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.LOADED))
      return state
    })
  }

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
    queryStrIsValidEmail,
  }
}

function translated_messages_label(count: number) {
  // the search function truncates search to 1000 items for global search
  if (count === 1000) {
    return window.static_translate('n_messages', '1000+', { quantity: 'other' })
  } else {
    return translate_n('n_messages', count)
  }
}
