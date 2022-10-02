import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
  ComponentType,
  useMemo,
} from 'react'
import { useChatListContextMenu } from './ChatListContextMenu'
import { useMessageResults, useChatList } from './ChatListHelpers'
import {
  ChatListItemRowChat,
  ChatListItemRowContact,
  ChatListItemRowMessage,
} from './ChatListItemRow'
import { PseudoListItemAddContact } from '../helpers/PseudoListItem'
import { C } from 'deltachat-node/node/dist/constants'
import { DeltaBackend } from '../../delta-remote'
import { useContactIds } from '../contact/ContactList'
import { MessageSearchResult } from '../../../shared/shared-types'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  FixedSizeList as List,
  ListChildComponentProps,
  ListItemKeySelector,
} from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import { onDCEvent } from '../../ipc'
import { ScreenContext } from '../../contexts'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'

import {
  createChatByContactIdAndSelectIt,
  selectChat,
} from '../helpers/ChatMethods'
import { useThemeCssVar } from '../../ThemeManager'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

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
  itemData?: any
  itemHeight: number
}) {
  return (
    <InfiniteLoader
      isItemLoaded={isRowLoaded}
      itemCount={rowCount}
      loadMoreItems={loadMoreRows}
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
  onExitSearch?: () => void
  onChatClick: (chatId: number) => void
}) {
  const { selectedChatId, showArchivedChats, onChatClick, queryStr } = props
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
  } = useContactAndMessageLogic(queryStr)

  const { chatListIds, isChatLoaded, loadChats, chatCache } = useLogicChatPart(
    queryStr,
    showArchivedChats
  )

  const openContextMenu = useChatListContextMenu()

  const addContactOnClick = async () => {
    if (!queryStrIsValidEmail || !queryStr) return

    const contactId = await BackendRemote.rpc.contactsCreateContact(
      selectedAccountId(),
      queryStr,
      null
    )
    await createChatByContactIdAndSelectIt(contactId)
    props.onExitSearch && props.onExitSearch()
  }
  const screenContext = useContext(ScreenContext)

  const { openDialog } = screenContext

  const onCreateChat = () => {
    screenContext.openDialog('CreateChat', {})
  }

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64
  const CHATLISTITEM_CONTACT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-contact-height')) || 64
  const CHATLISTITEM_MESSAGE_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-message-height')) || 64
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
    ([chatId, _messageId]) => chatId === selectedChatId
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

  const selectFirstChat = () => selectChat(chatListIds[0][0])

  // KeyboardShortcuts ---------
  useKeyBindingAction(KeybindAction.ChatList_ScrollToSelectedChat, () =>
    scrollSelectedChatIntoView(selectedChatIndex)
  )

  useKeyBindingAction(KeybindAction.ChatList_SelectNextChat, () => {
    if (selectedChatId === null) return selectFirstChat()
    const selectedChatIndex = chatListIds.findIndex(
      ([chatId, _messageId]) => chatId === selectedChatId
    )
    const [newChatId] = chatListIds[selectedChatIndex + 1] || []
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_SelectPreviousChat, () => {
    if (selectedChatId === null) return selectFirstChat()
    const selectedChatIndex = chatListIds.findIndex(
      ([chatId, _messageId]) => chatId === selectedChatId
    )
    const [newChatId] = chatListIds[selectedChatIndex - 1] || []
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(newChatId)
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
    }
  }, [selectedChatId, chatListIds, chatCache, onChatClick, openContextMenu])

  const contactlistData = useMemo(() => {
    return {
      contactCache,
      contactIds,
      screenContext,
    }
  }, [contactCache, contactIds, screenContext])

  const messagelistData = useMemo(() => {
    return { messageResultIds, messageCache, openDialog, queryStr }
  }, [messageResultIds, messageCache, openDialog, queryStr])

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
                          queryStr={queryStr || ''}
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
                style={{ left: width - 65 }}
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
export function useLogicVirtualChatList(chatListIds: [number, number][]) {
  const accountId = selectedAccountId()
  // workaround to save a current reference of chatListIds
  const chatListIdsRef = useRef(chatListIds)
  if (chatListIdsRef.current !== chatListIds) {
    // this is simmilar to a use hook doing this, but probably less expensive
    chatListIdsRef.current = chatListIds
  }
  // end workaround

  const [chatCache, setChatCache] = useState<{
    [id: number]: Type.ChatListItemFetchResult
  }>({})
  /** referrence to newest chat cache for use in useEffect functions that listen for events */
  const chatCacheRef = useRef<typeof chatCache>({})
  chatCacheRef.current = chatCache

  const [chatLoadState, setChatLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isChatLoaded: (index: number) => boolean = index =>
    !!chatLoadState[chatListIds[index][0]]
  const loadChats: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void> = async (startIndex, stopIndex) => {
    const entries = chatListIds.slice(startIndex, stopIndex + 1)
    setChatLoading(state => {
      entries.forEach(
        ([chatId, _msgId]) => (state[chatId] = LoadStatus.FETCHING)
      )
      return state
    })
    const chats = await BackendRemote.rpc.getChatlistItemsByEntries(
      accountId,
      entries
    )
    setChatCache(cache => ({ ...cache, ...chats }))
    setChatLoading(state => {
      entries.forEach(([chatId, _msgId]) => (state[chatId] = LoadStatus.LOADED))
      return state
    })
  }

  const onChatListItemChanged = useMemo(() => {
    let debouncingChatlistItemRequests: { [chatid: number]: number } = {}
    let cleanup_timeout: any | null = null
    const updateChatListItem = async (chatId: number) => {
      if (cleanup_timeout === null) {
        // clean up debouncingChatlistItemRequests every half minute,
        // so if there should ever be an error it auto recovers
        cleanup_timeout = setTimeout(() => {
          debouncingChatlistItemRequests = {}
          cleanup_timeout = null
        }, 30000)
      }
      debouncingChatlistItemRequests[chatId] = 1
      // the message id of the event could be an older message than the newest message (for example msg-read event)
      const chatlist = await BackendRemote.rpc.getChatlistEntries(
        accountId,
        null,
        null,
        null
      )
      const result = chatlist.find(([chat]) => chat === chatId)
      if (result) {
        setChatLoading(state => ({
          ...state,
          [chatId]: LoadStatus.FETCHING,
        }))
        const chats = await BackendRemote.rpc.getChatlistItemsByEntries(
          accountId,
          [result]
        )
        setChatCache(cache => ({ ...cache, ...chats }))
        setChatLoading(state => ({
          ...state,
          [chatId]: LoadStatus.LOADED,
        }))
      }

      if (debouncingChatlistItemRequests[chatId] > 1) {
        updateChatListItem(chatId)
      } else {
        debouncingChatlistItemRequests[chatId] = 0
      }
    }

    return (chatId: number, _messageId: number | string) => {
      if (chatId === C.DC_CHAT_ID_TRASH) {
        return
      }
      if (chatId !== 0) {
        if (
          debouncingChatlistItemRequests[chatId] === undefined ||
          debouncingChatlistItemRequests[chatId] === 0
        ) {
          updateChatListItem(chatId)
        } else {
          debouncingChatlistItemRequests[chatId] =
            debouncingChatlistItemRequests[chatId] + 1
        }
      }
    }
  }, [accountId])

  /**
   * refresh chats a specific contact is in if that contact changed.
   * Currently used for updating nickname changes in the summary of chatlistitems.
   */
  const onContactChanged = useCallback(
    async (contactId: number) => {
      if (contactId !== 0) {
        const chatListItems = await BackendRemote.rpc.getChatlistEntries(
          accountId,
          null,
          null,
          contactId
        )
        const inCurrentCache = Object.keys(chatCacheRef.current).map(v =>
          Number(v)
        )
        const toBeRefreshed = chatListItems.filter(
          ([chatId]) => inCurrentCache.indexOf(chatId) !== -1
        )
        const chats = await BackendRemote.rpc.getChatlistItemsByEntries(
          accountId,
          toBeRefreshed
        )
        setChatCache(cache => ({ ...cache, ...chats }))
      }
    },
    [accountId]
  )

  useEffect(() => {
    const removeOnChatListItemChangedListener = onDCEvent(
      [
        'DC_EVENT_MSG_READ',
        'DC_EVENT_MSG_DELIVERED',
        'DC_EVENT_MSG_FAILED',
        'DC_EVENT_CHAT_MODIFIED',
        'DC_EVENT_INCOMING_MSG',
        'DC_EVENT_MSGS_CHANGED',
        'DC_EVENT_MSGS_NOTICED',
      ],
      onChatListItemChanged
    )

    const removeOnContactChangedListener = onDCEvent(
      'DC_EVENT_CONTACTS_CHANGED',
      onContactChanged
    )

    return () => {
      removeOnChatListItemChangedListener()
      removeOnContactChangedListener()
    }
  }, [onChatListItemChanged, onContactChanged])

  // effects

  useEffect(() => {
    // force refresh of inital data
    loadChats(0, Math.min(chatListIds.length, 10))
  }, [chatListIds]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isChatLoaded, loadChats, chatCache }
}

function useLogicChatPart(
  queryStr: string | undefined,
  showArchivedChats: boolean
) {
  const { chatListIds, setQueryStr, setListFlags } = useChatList()
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds
  )

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

function useContactAndMessageLogic(queryStr: string | undefined) {
  const accountId = selectedAccountId()
  const { contactIds, queryStrIsValidEmail } = useContactIds(0, queryStr)
  const messageResultIds = useMessageResults(queryStr)

  // Contacts ----------------
  const [contactCache, setContactCache] = useState<{
    [id: number]: Type.Contact
  }>({})
  const [contactLoadState, setContactLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isContactLoaded: (index: number) => boolean = index =>
    !!contactLoadState[contactIds[index]]
  const loadContact: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void> = async (startIndex, stopIndex) => {
    const ids = contactIds.slice(startIndex, stopIndex + 1)

    setContactLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })

    const contacts = await BackendRemote.rpc.contactsGetContactsByIds(
      accountId,
      ids
    )
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

  useEffect(() => {
    // force refresh of inital data
    loadContact(0, Math.min(contactIds.length, 10))
    loadMessages(0, Math.min(messageResultIds.length, 10))
  }, [contactIds, messageResultIds]) // eslint-disable-line react-hooks/exhaustive-deps

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
