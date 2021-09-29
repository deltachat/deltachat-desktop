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
import { C } from 'deltachat-node/dist/constants'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { useContactIds } from '../contact/ContactList'
import {
  ChatListItemType,
  MessageSearchResult,
  JsonContact,
} from '../../../shared/shared-types'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  FixedSizeList as List,
  ListChildComponentProps,
  ListItemKeySelector,
} from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import { ipcBackend } from '../../ipc'
import { ScreenContext } from '../../contexts'
import { KeybindAction, useKeyBindingAction } from '../../keybindings'
import { getLogger } from '../../../shared/logger'

import { createChatByContactIdAndSelectIt } from '../helpers/ChatMethods'
import { useThemeCssVar } from '../../ThemeManager'

const log = getLogger('renderer/chatlist')

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
  setListRef?: (ref: List<any>) => void
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
  selectedChatId: number
  showArchivedChats: boolean
  queryStr?: string
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
    if (!queryStrIsValidEmail) return

    const contactId = await DeltaBackend.call(
      'contacts.createContact',
      queryStr
    )
    await createChatByContactIdAndSelectIt(contactId)
  }
  const screenContext = useContext(ScreenContext)
  const { openDialog } = screenContext

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
  const listRefRef = useRef<List<any>>()
  const selectedChatIndex = chatListIds.findIndex(
    ([chatId, _messageId]) => chatId === selectedChatId
  )

  const scrollSelectedChatIntoView = useCallback((index: number) => {
    if (index !== -1) {
      listRefRef.current?.scrollToItem(index)
    }
  }, [])

  // on select chat - scroll to selected chat - chatView
  // follow chat after loading or when it's position in the chatlist changes
  useEffect(() => {
    if (isSearchActive) {
      // search is active, don't scroll
      return
    }
    // when showArchivedChats changes, select selected chat if it is archived/not-archived otherwise select first item
    if (selectedChatIndex !== -1) {
      scrollSelectedChatIntoView(selectedChatIndex)
    } else {
      scrollSelectedChatIntoView(0)
    }
  }, [selectedChatIndex, isSearchActive, scrollSelectedChatIntoView])

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
                setListRef={(ref: List<any>) => (listRefRef.current = ref)}
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
                  {chatListIds.length === 0 && queryStrIsValidEmail && (
                    <div style={{ width: width }}>
                      <PseudoListItemAddContact
                        queryStr={queryStr}
                        queryStrIsEmail={queryStrIsValidEmail}
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
                    itemKey={index => 'key' + messageResultIds[index]}
                    itemData={messagelistData}
                    itemHeight={CHATLISTITEM_MESSAGE_HEIGHT}
                  >
                    {ChatListItemRowMessage}
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
  /** referrence to newest chat cache for use in useEffect functions that listen for events */
  const chatCacheRef = useRef<typeof chatCache>()
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

  /**
   * refresh chats a specific contact is in if that contac changed.
   * Currently used for updating nickname changes in the summary of chatlistitems.
   */
  const onContactChanged = async (_ev: any, [contactId]: [number]) => {
    if (contactId !== 0) {
      const chatListItems = await DeltaBackend.call(
        'chatList.getChatListEntries',
        null,
        '',
        contactId
      )
      const inCurrentCache = Object.keys(chatCacheRef.current).map(v =>
        Number(v)
      )
      const toBeRefreshed = chatListItems.filter(
        ([chatId]) => inCurrentCache.indexOf(chatId) !== -1
      )
      const chats = await DeltaBackend.call(
        'chatList.getChatListItemsByEntries',
        toBeRefreshed
      )
      setChatCache(cache => ({ ...cache, ...chats }))
    }
  }

  useEffect(() => {
    ipcBackend.on('DC_EVENT_MSG_READ', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSG_DELIVERED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSG_FAILED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_CHAT_MODIFIED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSGS_CHANGED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_MSGS_NOTICED', onChatListItemChanged)
    ipcBackend.on('DC_EVENT_CONTACTS_CHANGED', onContactChanged)

    return () => {
      ipcBackend.removeListener('DC_EVENT_MSG_READ', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSG_DELIVERED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSG_FAILED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_CHAT_MODIFIED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_INCOMING_MSG', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSGS_CHANGED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_MSGS_NOTICED', onChatListItemChanged)
      ipcBackend.removeListener('DC_EVENT_CONTACTS_CHANGED', onContactChanged)
    }
  }, [])

  // effects

  useEffect(() => {
    // force refresh of inital data
    loadChats(0, Math.min(chatListIds.length, 10))
  }, [chatListIds]) // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [queryStr, setQueryStr])

  useEffect(
    () =>
      showArchivedChats && queryStr.length === 0
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats, queryStr, setListFlags]
  )

  return { chatListIds, isChatLoaded, loadChats, chatCache }
}

function useContactAndMessageLogic(queryStr: string) {
  const { contactIds, queryStrIsValidEmail } = useContactIds(0, queryStr)
  const messageResultIds = useMessageResults(queryStr)

  // Contacts ----------------
  const [contactCache, setContactCache] = useState<{
    [id: number]: JsonContact
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
