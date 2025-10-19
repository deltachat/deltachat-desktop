import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ComponentType,
  useMemo,
  HTMLAttributes,
  useLayoutEffect,
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
import {
  PseudoListItemAddContact,
  PseudoListItemAddContactOrGroupFromInviteLink,
} from '../helpers/PseudoListItem'
import { KeybindAction } from '../../keybindings'
import { useThemeCssVar } from '../../ThemeManager'
import { BackendRemote, onDCEvent, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import CreateChat from '../dialogs/CreateChat'
import useChat from '../../hooks/chat/useChat'
import useCreateChatByContactId from '../../hooks/chat/useCreateChatByContactId'
import useDialog from '../../hooks/dialog/useDialog'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import useTranslationFunction, {
  useTranslationWritingDirection,
} from '../../hooks/useTranslationFunction'

import type {
  ChatListItemData,
  ChatListContactItemData,
  ChatListMessageItemData,
} from './ChatListItemRow'
import { isInviteLink } from '../../../../shared/util'
import { RovingTabindexProvider } from '../../contexts/RovingTabindex'
import { useRpcFetch } from '../../hooks/useFetch'
import { useSettingsStore } from '../../stores/settings'
import { useMultiselect } from '../../hooks/useMultiselect'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { useHasChanged2 } from '../../hooks/useHasChanged'

const useMultiselectLog = getLogger('ChatListMultiselect')

const enum LoadStatus {
  FETCHING = 1,
  LOADED = 2,
}

/**
 * This component holds either a list of chats OR the result
 * of a search query including chats, contacts and messages.
 *
 * <ChatList>
 *   <ChatListPart> // virtual list (one for each type of search result)
 *     <ChatListItemRow>
 *       <ChatListItem(Default (Chat) | Message | Contact) />
 *     </ChatListItemRow>
 *   </ChatListPart>
 * </ChatList>
 */

/**
 * wrapper for a virtual list that handles scrolling and loading items
 *
 * ChatList has two modes: regular and search mode.
 * In search mode there are 3 ChatListParts: for chats, contacts, and messages
 */
export function ChatListPart<
  T extends
    | ChatListItemData
    | ChatListContactItemData
    | ChatListMessageItemData,
>({
  isRowLoaded,
  loadMoreRows,
  rowCount,
  width,
  children,
  height,
  itemKey,
  setListRef,
  olElementAttrs,
  itemData,
  itemHeight,
}: {
  isRowLoaded: (index: number) => boolean
  loadMoreRows: (startIndex: number, stopIndex: number) => Promise<any>
  rowCount: number
  width: number | string
  children: ComponentType<ListChildComponentProps<T>>
  height: number
  itemKey: ListItemKeySelector<T>
  setListRef?: (ref: List<T> | null) => void
  /**
   * This does _not_ support maps with dynamically added/removed keys.
   */
  olElementAttrs?: HTMLAttributes<HTMLOListElement>
  itemData: T
  itemHeight: number
}) {
  const writingDirection = useTranslationWritingDirection()

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

  const olRef = useRef<HTMLOListElement>(null)
  // 'react-window' does not expose API to set attributes on its element,
  // so we have to `useLayoutEffect`.
  useLayoutEffect(() => {
    if (olRef.current == null) {
      return
    }
    if (olElementAttrs == undefined) {
      return
    }

    for (const [key, value] of Object.entries(olElementAttrs)) {
      if (value == undefined) {
        olRef.current.removeAttribute(key)
      } else {
        olRef.current.setAttribute(key, value)
      }
    }
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
          innerElementType={'ol'}
          innerRef={olRef}
          className='react-window-list-reset'
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
          direction={writingDirection}
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
    selectedChatId: activeChatId,
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

  const { openContextMenu, activeContextMenuChatIds } = useChatListContextMenu()
  const createChatByContactId = useCreateChatByContactId()
  const { selectChat } = useChat()

  const rovingTabindexItemsClassName = 'roving-tabindex'
  const rootRef = useRef<HTMLDivElement>(null)
  const tabindexWrapperElementChats = useRef<HTMLDivElement>(null)
  const tabindexWrapperElementContacts = useRef<HTMLDivElement>(null)
  const tabindexWrapperElementMessages = useRef<HTMLDivElement>(null)

  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.is_chatmail === '1'

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
    // Same as `KeybindAction.NewChat_Open`.
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

  const showPseudoListItemAddContactFromInviteLink =
    queryStr && isInviteLink(queryStr)
  const messagesHeight = (height: number) =>
    height -
    (DIVIDER_HEIGHT * 3 +
      chatsHeight(height) +
      contactsHeight(height) +
      (chatListIds.length == 0 && queryStrIsValidEmail
        ? CHATLISTITEM_MESSAGE_HEIGHT
        : 0) +
      (showPseudoListItemAddContactFromInviteLink
        ? CHATLISTITEM_MESSAGE_HEIGHT
        : 0))

  const chatListRef = useRef<List<any>>(null)
  const scrollChatIntoView = useCallback((index: number) => {
    if (index !== -1) {
      chatListRef.current?.scrollToItem(index)
    }
  }, [])

  const activeChatIndex = useMemo(
    () => (activeChatId != null ? chatListIds.indexOf(activeChatId) : -1),
    [chatListIds, activeChatId]
  )
  const lastShowArchivedChatsState = useRef(showArchivedChats)
  const lastQuery = useRef(queryStr)
  // on select chat - scroll to selected chat - chatView
  // follow chat after loading or when it's position in the chatlist changes
  useEffect(() => {
    if (isSearchActive && lastQuery.current !== queryStr) {
      scrollChatIntoView(0)
      // search is active, don't scroll to selected chat, scroll up instead when queryStr changes
      lastQuery.current = queryStr
      return
    }
    // when showArchivedChats changes, select selected chat if it is archived/not-archived otherwise select first item
    if (activeChatIndex !== -1) {
      scrollChatIntoView(activeChatIndex)
    } else {
      if (lastShowArchivedChatsState.current !== showArchivedChats) {
        scrollChatIntoView(0)
      }
    }
    lastShowArchivedChatsState.current = showArchivedChats
  }, [
    activeChatIndex,
    isSearchActive,
    scrollChatIntoView,
    showArchivedChats,
    queryStr,
  ])

  const selectFirstChat = () => selectChat(accountId, chatListIds[0])

  // KeyboardShortcuts ---------
  useKeyBindingAction(KeybindAction.ChatList_ScrollToSelectedChat, () =>
    scrollChatIntoView(activeChatIndex)
  )

  useKeyBindingAction(KeybindAction.ChatList_SelectNextChat, () => {
    if (activeChatId === null) return selectFirstChat()
    const activeChatIndex = chatListIds.indexOf(activeChatId)
    const newChatId = chatListIds[activeChatIndex + 1]
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(accountId, newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_SelectPreviousChat, () => {
    if (activeChatId === null) return selectFirstChat()
    const activeChatIndex = chatListIds.indexOf(activeChatId)
    const newChatId = chatListIds[activeChatIndex - 1]
    if (newChatId && newChatId !== C.DC_CHAT_ID_ARCHIVED_LINK) {
      selectChat(accountId, newChatId)
    }
  })

  useKeyBindingAction(KeybindAction.ChatList_FocusItems, () => {
    ;(
      rootRef.current?.querySelector(
        // Not just the first element, but the active one, i.e.
        // if the user already interacted with the list we should not reset
        // the current selection.
        '.' + rovingTabindexItemsClassName + ':not([tabindex="-1"])'
      ) as HTMLElement
    )?.focus()
  })
  // useKeyBindingAction(KeybindAction.ChatList_SelectFirstChat, () =>
  //   selectFirstChat()
  // )

  const multiselect = useChatListMultiselect(
    chatListIds,
    activeChatId,
    accountId
  )

  const chatlistData: ChatListItemData = useMemo(() => {
    return {
      // This should be in sync with `olElementAttrs` of `ChatListPart`.
      roleTabs: true,

      activeChatId,
      multiselect,
      chatListIds,
      chatCache,
      onChatClick,
      openContextMenu,
      activeContextMenuChatIds,
    }
  }, [
    activeChatId,
    multiselect,
    chatListIds,
    chatCache,
    onChatClick,
    openContextMenu,
    activeContextMenuChatIds,
  ])

  const contactlistData: ChatListContactItemData = useMemo(() => {
    return {
      contactCache,
      contactIds,
    }
  }, [contactCache, contactIds])

  const messagelistData: ChatListMessageItemData = useMemo(() => {
    return {
      messageResultIds,
      messageCache,
      queryStr,
      isSingleChatSearch: queryChatId != null,
    }
  }, [messageResultIds, messageCache, queryStr, queryChatId])

  const searchChatInfoFetch = useRpcFetch(
    BackendRemote.rpc.getBasicChatInfo,
    queryChatId ? [accountId, queryChatId] : null
  )
  if (searchChatInfoFetch?.result?.ok === false) {
    console.error(searchChatInfoFetch.result.err)
  }
  const searchChatInfo = searchChatInfoFetch?.result?.ok
    ? searchChatInfoFetch.result.value
    : null

  // Render --------------------
  const tx = useTranslationFunction()

  if (queryChatId && searchChatInfo) {
    return (
      <div ref={rootRef} className='chat-list'>
        <AutoSizer disableWidth>
          {({ height }) => (
            <div ref={tabindexWrapperElementChats}>
              <div
                id='search-result-divider-messages'
                className='search-result-divider'
              >
                {tx('search_in', searchChatInfo.name)}
                {messageResultIds.length !== 0 &&
                  ': ' + translate_n('n_messages', messageResultIds.length)}
              </div>
              <RovingTabindexProvider
                wrapperElementRef={tabindexWrapperElementChats}
                classNameOfTargetElements={rovingTabindexItemsClassName}
              >
                <ChatListPart
                  olElementAttrs={{
                    'aria-labelledby': 'search-result-divider-messages',
                  }}
                  isRowLoaded={isMessageLoaded}
                  loadMoreRows={loadMessages}
                  rowCount={messageResultIds.length}
                  width={'100%'}
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
              </RovingTabindexProvider>
            </div>
          )}
        </AutoSizer>
      </div>
    )
  }

  return (
    <div ref={rootRef} className='chat-list'>
      <AutoSizer disableWidth>
        {({ height }) => (
          <>
            {isSearchActive && (
              <div
                id='search-result-divider-chats'
                className='search-result-divider'
              >
                {translate_n('n_chats', chatListIds.length)}
              </div>
            )}
            {/* TODO RovingTabindex doesn't work well with virtualized
              lists, because the currently active element might get removed
              from DOM if scrolled out of view. */}
            <RovingTabindexProvider
              wrapperElementRef={tabindexWrapperElementChats}
              classNameOfTargetElements={rovingTabindexItemsClassName}
            >
              <div ref={tabindexWrapperElementChats}>
                <ChatListPart
                  olElementAttrs={{
                    // Note that there are many `ChatListPart` instances,
                    // but not all of them are `role='tablist'`.
                    //
                    // Also note that not all the interactive items
                    // have role='tab'. For example, `ChatListItemArchiveLink`.
                    //
                    // Aaand also note that we do not set `role='tabpanel'`
                    // on the "chat" section, out of fear that screen readers
                    // will get too verbose.
                    // TODO this should be reconsidered.
                    // The same goes for the accounts list items,
                    // which are arguably also tabs.
                    //
                    // This should be in sync with `chatlistData.roleTabs`.
                    role: 'tablist',
                    'aria-orientation': 'vertical',
                    'aria-multiselectable': multiselect != undefined,

                    'aria-labelledby': isSearchActive
                      ? 'search-result-divider-chats'
                      : undefined,
                    // When `!isSearchActive`, the wrapper `<section>` label
                    // is enough.
                  }}
                  isRowLoaded={isChatLoaded}
                  loadMoreRows={loadChats}
                  rowCount={chatListIds.length}
                  width={'100%'}
                  height={chatsHeight(height)}
                  setListRef={(ref: List<any> | null) =>
                    ((chatListRef.current as any) = ref)
                  }
                  itemKey={index => 'key' + chatListIds[index]}
                  itemData={chatlistData}
                  itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                >
                  {ChatListItemRowChat}
                </ChatListPart>
              </div>
              {isSearchActive && (
                <>
                  <div
                    id='search-result-divider-contacts'
                    className='search-result-divider'
                  >
                    {translate_n('n_contacts', contactIds.length)}
                  </div>
                  <RovingTabindexProvider
                    wrapperElementRef={tabindexWrapperElementContacts}
                    classNameOfTargetElements={rovingTabindexItemsClassName}
                  >
                    <div ref={tabindexWrapperElementContacts}>
                      <ChatListPart
                        olElementAttrs={{
                          'aria-labelledby': 'search-result-divider-contacts',
                        }}
                        isRowLoaded={isContactLoaded}
                        loadMoreRows={loadContact}
                        rowCount={contactIds.length}
                        width={'100%'}
                        height={contactsHeight(height)}
                        itemKey={index => 'key' + contactIds[index]}
                        itemData={contactlistData}
                        itemHeight={CHATLISTITEM_CONTACT_HEIGHT}
                      >
                        {ChatListItemRowContact}
                      </ChatListPart>
                      {!isChatmail &&
                        contactIds.length === 0 &&
                        chatListIds.length === 0 &&
                        queryStrIsValidEmail && (
                          <PseudoListItemAddContact
                            queryStr={queryStr?.trim() || ''}
                            queryStrIsEmail={queryStrIsValidEmail}
                            onClick={addContactOnClick}
                          />
                        )}
                      {showPseudoListItemAddContactFromInviteLink && (
                        <PseudoListItemAddContactOrGroupFromInviteLink
                          inviteLink={queryStr!}
                          accountId={accountId}
                        />
                      )}
                    </div>
                  </RovingTabindexProvider>
                  <div
                    id='search-result-divider-messages'
                    className='search-result-divider'
                  >
                    {translated_messages_label(messageResultIds.length)}
                  </div>

                  <RovingTabindexProvider
                    wrapperElementRef={tabindexWrapperElementMessages}
                    classNameOfTargetElements={rovingTabindexItemsClassName}
                  >
                    <div ref={tabindexWrapperElementMessages}>
                      <ChatListPart
                        olElementAttrs={{
                          'aria-labelledby': 'search-result-divider-messages',
                        }}
                        isRowLoaded={isMessageLoaded}
                        loadMoreRows={loadMessages}
                        rowCount={messageResultIds.length}
                        width={'100%'}
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
                    </div>
                  </RovingTabindexProvider>
                </>
              )}
            </RovingTabindexProvider>
            <button
              className='floating-action-button'
              onClick={onCreateChat}
              id='new-chat-button'
              aria-label={tx('menu_new_chat')}
              aria-keyshortcuts='Control+N'
              data-testid='new-chat-button'
            >
              <div
                className='Icon'
                style={{
                  WebkitMask: 'url(./images/icons/plus.svg) no-repeat center',
                }}
              ></div>
            </button>
          </>
        )}
      </AutoSizer>
    </div>
  )
}

function translate_n(
  key: Parameters<typeof window.static_translate>[0],
  quantity: number
) {
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
    }
  }, [accountId])

  return { isChatLoaded, loadChats, chatCache }
}

function useLogicChatPart(
  queryStr: string | undefined,
  showArchivedChats: boolean
) {
  const listFlags =
    showArchivedChats && queryStr?.length === 0 ? C.DC_GCL_ARCHIVED_ONLY : 0

  const { chatListIds } = useChatList(listFlags, queryStr)
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

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

function useChatListMultiselect(
  chatListIds: Awaited<ReturnType<typeof BackendRemote.rpc.getChatlistEntries>>,
  activeChatId: T.BasicChat['id'] | null,
  accountId: number
) {
  const [dummyValueForSelectionReset, _setDummyValueForSelectionReset] =
    useState(Symbol())
  const resetSelection = useCallback(
    () => _setDummyValueForSelectionReset(Symbol()),
    []
  )
  /**
   * This is used to tell whether a selection is "valid",
   * otherwise we should use the default, reset state.
   * When this value changes, the previous selection becomes invalid.
   */
  const selectionId_ = useMemo(
    () => Symbol(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // When the active chat gets changed, for example, as a result of
      // executing the Ctrl + PageDown shortcut,
      // we want to reset selection, invalidate it,
      // to reduce confusion,
      // e.g. "is the currently active chat selected or not?"
      //
      // `activeChatId` never (or almost never?) gets changed
      // automatically, it's always a result of a user action,
      // so resetting selection in this case shouldn't make users angry.
      activeChatId,
      dummyValueForSelectionReset,
      // It's not strictly necessary to watch `accountId` as of now,
      // because the code above this hook ensures that the component
      // is re-created when accountId changes.
      // But let's do it for future-proofing.
      accountId,
    ]
  )
  // Put behind a ref to avoid re-renders.
  const selectionId = useRef(selectionId_)
  selectionId.current = selectionId_

  const [multiselectState_, setMultiselectState_] = useState({
    selectedChats: new Set<(typeof chatListIds)[number]>(),
    // Initialize with a new Symbol so that the initial state is "invalid".
    forSelectionId: Symbol(),
  })
  const setSelectedChats = useCallback(
    (newSelectedChats: Set<(typeof chatListIds)[number]>) => {
      setMultiselectState_({
        selectedChats: newSelectedChats,
        forSelectionId: selectionId.current,
      })
    },
    []
  )
  const activeChatSet: Set<(typeof chatListIds)[number]> = useMemo(
    () => (activeChatId == null ? new Set() : new Set([activeChatId])),
    [activeChatId]
  )
  const multiselectStateIsValid =
    selectionId.current === multiselectState_.forSelectionId
  const selectedChats = multiselectStateIsValid
    ? multiselectState_.selectedChats
    : // Make sure to have the active chat selected by default,
      // e.g. for the case when the user wants to Ctrl + Click
      // another chat.
      // This is important, because the chat list items
      // are only styled as "selected" based on `multiselect`,
      // and not `activeChatId` (see `isSelected` in `ChatListItemRowChat`).
      //
      // TODO or should we do this though? Why complicate things?
      // Just mark "selected" and "active" chat distinctly
      // and we're good?
      // Maybe it's better to manage this inside of `useMultiselect`?
      activeChatSet

  // Remove chats from selection that have been removed from `chatListIds`.
  //
  // Why not `useMemo`? Because if the removed chat gets added back to the list,
  // we _don't_ want it to get added back to selection,
  // to avoid, let's say, accidentally deleting a chat.
  //
  // For example, let's say the user had two chats selected, but then
  // one of the selected chats got archived (e.g. from another device).
  // Then they forgot about selecting it and went to delete some other chats:
  // they selected two other chats for deletion, but then a message arrives
  // to the archived chat, unarchiving it.
  // This would suddenly make 4 chats selected, instead of 3,
  // and they could unintentionally delete the one they archived.
  //
  // An alternative would be to simply reset (invalidate) selection
  // on _any_ change to `chatListIds`,
  // but that would not be nice, e.g. for example if only the order
  // of chat list items changed, e.g. when receiving a new message.
  //
  // This also handles the more common case of simply resetting selection
  // after you have deleted / archived selected chats.
  //
  // TODO should this be part of `useMultiselect`?
  // Or at least another, more "advanced" but still generic wrapper for it.
  if (useHasChanged2(chatListIds)) {
    // Using `multiselectState_.selectedChats` instead of `selectedChats`
    // To avoid an infinite loop of `setMultiselectState_`
    // when `selectedChats === activeChatSet`.
    const newSelectedChats = new Set(multiselectState_.selectedChats)
    let foundMissing = false
    for (const id of multiselectState_.selectedChats) {
      if (!chatListIds.includes(id)) {
        foundMissing = true
        newSelectedChats.delete(id)
      }
    }
    if (foundMissing) {
      setMultiselectState_(old => ({
        selectedChats: newSelectedChats,
        // Keep the ID: in case it's already invalid, don't revalidate it.
        forSelectionId: old.forSelectionId,
      }))
    }
  }

  const multiselect = useMultiselect(
    chatListIds,
    selectedChats,
    useCallback(
      newSelectedChats => {
        // `chatListIds` might include `C.DC_CHAT_ID_ARCHIVED_LINK`.
        // Let's make sure that only normal chat list items can be selected
        // with multiselect.
        // Note that the context menu and regular clicks still work
        // for these chats.
        // This is primarily for `C.DC_CHAT_ID_ARCHIVED_LINK`,
        // but let's be conservative and also exclude
        // other weird chat list items.
        for (let i = 0; i <= C.DC_CHAT_ID_LAST_SPECIAL; i++) {
          newSelectedChats.delete(i)
        }

        // TODO perf: to avoid re-renders, maybe store this into a ref,
        // but only update reactive state only if there are 2+ items selected?
        setSelectedChats(newSelectedChats)
      },
      [setSelectedChats]
    ),
    useMultiselectLog
  )

  return useMemo(
    () => ({
      ...multiselect,
      setSelectedChats,
      resetSelection,
    }),
    [multiselect, setSelectedChats, resetSelection]
  )
}

function translated_messages_label(count: number) {
  // the search function truncates search to 1000 items for global search
  if (count === 1000) {
    return window.static_translate('n_messages', '1000+', { quantity: 'other' })
  } else {
    return translate_n('n_messages', count)
  }
}
