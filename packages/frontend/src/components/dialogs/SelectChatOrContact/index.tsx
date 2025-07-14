import AutoSizer from 'react-virtualized-auto-sizer'
import React, {
  HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { useLogicVirtualChatList } from '../../chat/ChatList'
import { useThemeCssVar } from '../../../ThemeManager'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'
import { useFetch } from '../../../hooks/useFetch'
import { BackendRemote, Type } from '../../../backend-com'
import asyncThrottle from '@jcoreio/async-throttle'
import { C } from '@deltachat/jsonrpc-client'
import { TranslationKey } from '@deltachat-desktop/shared/translationKeyType'
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeList } from 'react-window'
import { ChatListItemFetchResult } from '@deltachat/jsonrpc-client/dist/generated/types'
import { selectedAccountId } from '../../../ScreenController'
import { getLogger } from '@deltachat-desktop/shared/logger'
import ChatListItem, { PlaceholderChatListItem } from '../../chat/ChatListItem'
import { ContactListItem } from '../../contact/ContactListItem'

const log = getLogger('renderer/Components/SelectChatOrContact')

type Props = {
  onClose: DialogProps['onClose']
  headerTitle: string
  onChatClick: (chatId: number) => void
  onContactClick: (contactId: number) => void
  footer?: React.ReactElement
}

enum ListItemType {
  CHAT,
  CONTACT,
  SEPERATOR,
}
type ListItem = (
  | { kind: ListItemType.CHAT; chatId: number }
  | { kind: ListItemType.CONTACT; contactId: number }
  | {
      kind: ListItemType.SEPERATOR
      translationKey: TranslationKey
    }
) & { key: string }

/** Select chats and show contact list bellow,
 * so you can also search for contacts that do not have a chat
 * see https://github.com/deltachat/deltachat-desktop/issues/3030 */
export default function SelectChatOrContact(props: Props) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const [queryStr, setQueryStr] = useState('')

  const listFetch = useFetch(
    useMemo(
      () =>
        asyncThrottle(async (accountId: number, queryStr: string | null) => {
          const [chats, contacts] = await Promise.all([
            BackendRemote.rpc.getChatlistEntries(
              accountId,
              C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS,
              queryStr,
              null
            ),
            BackendRemote.rpc.getContactIds(accountId, 0, queryStr),
          ])

          return {
            list: [
              ...(chats.map(item => ({
                kind: ListItemType.CHAT,
                chatId: item,
                key: `ch.${item}`,
              })) as ListItem[]),
              ...(contacts.length != 0
                ? [
                    {
                      kind: ListItemType.SEPERATOR,
                      translationKey: 'contacts_title',
                      key: 'contacts_title',
                    } as ListItem,
                    ...(contacts.map(item => ({
                      kind: ListItemType.CONTACT,
                      contactId: item,
                      key: `co.${item}`,
                    })) as ListItem[]),
                  ]
                : []),
            ] as ListItem[],
            chats,
            contacts,
          }
        }, 200),
      []
    ),
    [
      accountId, // accountId
      queryStr || null, // queryStr
    ]
  )
  const {
    chats,
    list,
    contacts: _, // unused
  } = listFetch.lingeringResult?.ok
    ? listFetch.lingeringResult.value
    : { chats: [], contacts: [], list: [] }

  const { loadChatsByChatIds, chatCache, isChatLoadedByChatId } =
    useLogicVirtualChatList(chats)
  const { contactCache, loadContactsByContactIds, isContactLoadedByContactId } =
    useLazyLoadedContacts()

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const noResults = list.length === 0 && queryStr !== ''

  const chatListRef = useRef<HTMLDivElement>(null)

  return (
    <Dialog className={styles.selectChatDialog} onClose={props.onClose} fixed>
      <DialogHeader onClose={props.onClose} title={props.headerTitle} />
      <DialogBody className={styles.selectChatDialogBody}>
        <div className='select-chat-account-input'>
          <input
            className='search-input'
            data-no-drag-region
            onChange={onSearchChange}
            value={queryStr}
            placeholder={tx('search')}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div className='select-chat-list-chat-list' ref={chatListRef}>
          <RovingTabindexProvider wrapperElementRef={chatListRef}>
            {noResults && queryStr && (
              <PseudoListItemNoSearchResults queryStr={queryStr} />
            )}
            <div style={{ height: noResults ? '0px' : '100%' }}>
              <AutoSizer disableWidth>
                {({ height }) => (
                  <List
                    olElementAttrs={{
                      'aria-label': 'chats and contacts', // TODO translate
                    }}
                    isRowLoaded={index => {
                      if (list[index]?.kind == ListItemType.SEPERATOR) {
                        return true
                      } else if (list[index]?.kind == ListItemType.CHAT) {
                        return isChatLoadedByChatId(list[index].chatId)
                      } else if (list[index]?.kind == ListItemType.CONTACT) {
                        return isContactLoadedByContactId(list[index].contactId)
                      } else {
                        // there was some issue - type can't be determined
                        return false
                      }
                    }}
                    loadMoreRows={(startIndex, stopIndex) => {
                      const chats: number[] = []
                      const contacts: number[] = []
                      for (const item of list.slice(
                        startIndex,
                        stopIndex + 1
                      )) {
                        if (item.kind == ListItemType.CHAT) {
                          chats.push(item.chatId)
                        } else if (item.kind == ListItemType.CONTACT) {
                          contacts.push(item.contactId)
                        }
                      }
                      return Promise.all([
                        chats.length != 0
                          ? loadChatsByChatIds(chats)
                          : Promise.resolve(),
                        contacts.length != 0
                          ? loadContactsByContactIds(contacts)
                          : Promise.resolve(),
                      ])
                    }}
                    rowCount={list.length}
                    width={'100%'}
                    height={height}
                    itemData={{
                      items: list,
                      chatCache,
                      contactCache,

                      onChatClick: props.onChatClick,
                      onContactClick: props.onContactClick,
                    }}
                  />
                )}
              </AutoSizer>
            </div>
          </RovingTabindexProvider>
        </div>
      </DialogBody>
      {props.footer}
    </Dialog>
  )
}

const CHATLISTITEM_SEPERATOR_HEIGHT = 36

function List({
  isRowLoaded,
  loadMoreRows,
  rowCount,
  width,
  height,
  setListRef,
  olElementAttrs,
  itemData,
}: {
  isRowLoaded: (index: number) => boolean
  loadMoreRows: (startIndex: number, stopIndex: number) => Promise<any>
  rowCount: number
  width: number | string
  height: number
  setListRef?: (ref: VariableSizeList<any> | null) => void
  /**
   * This does _not_ support maps with dynamically added/removed keys.
   */
  olElementAttrs?: HTMLAttributes<HTMLOListElement>
  itemData: {
    items: ListItem[]
    chatCache: {
      [id: number]: ChatListItemFetchResult | undefined
    }
    contactCache: {
      [id: number]: Type.Contact | undefined
    }
    onChatClick: (chatId: number) => void
    onContactClick: (contactId: number) => void
  }
}) {
  const tx = useTranslationFunction()
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

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64
  const CHATLISTITEM_CONTACT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-contact-height')) || 64

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
        <VariableSizeList
          innerElementType={'ol'}
          innerRef={olRef}
          className='react-window-list-reset'
          height={height}
          itemCount={rowCount}
          estimatedItemSize={CHATLISTITEM_CHAT_HEIGHT}
          itemSize={index => {
            if (itemData.items[index]?.kind == ListItemType.SEPERATOR) {
              return CHATLISTITEM_SEPERATOR_HEIGHT
            } else if (itemData.items[index]?.kind == ListItemType.CHAT) {
              return CHATLISTITEM_CHAT_HEIGHT
            } else if (itemData.items[index]?.kind == ListItemType.CONTACT) {
              return CHATLISTITEM_CONTACT_HEIGHT
            } else {
              log.warn(
                "itemdata kind can't be determined",
                { itemData },
                itemData.items[index]
              )
              return 100
            }
          }}
          key={rowCount} // force re create list, otherwise, item size may not be correct anymore
          onItemsRendered={onItemsRendered}
          ref={r => {
            ;(ref as any)(r)
            setListRef && setListRef(r)
          }}
          width={width}
          itemKey={index => itemData.items[index]?.key}
          itemData={itemData}
        >
          {({
            index,
            data,
            style,
          }: {
            index: number
            data: typeof itemData
            style: React.CSSProperties
          }) => {
            // IDEA move to own component, maybe own file?
            const item = data.items[index]
            let element: React.JSX.Element = <div>{'unknown list element'}</div>
            if (item?.kind == ListItemType.SEPERATOR) {
              // TODO: add style
              element = <div>{tx(item.translationKey)}</div>
            } else if (item?.kind == ListItemType.CHAT) {
              const { chatId } = item
              element = (
                <ChatListItem
                  chatListItem={data.chatCache[item.chatId] || undefined}
                  onClick={data.onChatClick.bind(null, chatId)}
                />
              )
            } else if (item?.kind == ListItemType.CONTACT) {
              const { contactId } = item
              const contact = data.contactCache[contactId]
              element = contact ? (
                <ContactListItem
                  tagName='div'
                  contact={contact}
                  showCheckbox={false}
                  checked={false}
                  showRemove={false}
                  onClick={data.onContactClick.bind(null, contactId)}
                />
              ) : (
                <PlaceholderChatListItem />
              )
            } else {
              // there was some issue - type can't be determined
              log.warn(
                "render element: itemdata kind can't be determined",
                { itemData },
                item
              )
              return 100
            }

            return <li style={style}>{element}</li>
          }}
        </VariableSizeList>
      )}
    </InfiniteLoader>
  )
}

function useLazyLoadedContacts() {
  const accountId = selectedAccountId()

  const enum LoadStatus {
    FETCHING = 1,
    LOADED = 2,
  }

  // TODO perf: shall we use Map instead of an object?
  // Or does it not matter since there is not going to be too many contacts?
  const [contactCache, setContactCache] = useState<{
    [id: number]: Type.Contact | undefined
  }>({})
  const [contactLoadState, setContactLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})
  const isContactLoadedByContactId: (
    contactId: number
  ) => boolean = contactId => !!contactLoadState[contactId]

  const loadContactsByContactIds: (
    ids: number[]
  ) => Promise<void> = async ids => {
    setContactLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })

    const contacts = await BackendRemote.rpc.getContactsByIds(accountId, ids)
    setContactCache(cache => ({ ...cache, ...contacts }))
    setContactLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.LOADED))
      return state
    })
  }

  return {
    contactCache,
    isContactLoadedByContactId,
    loadContactsByContactIds,
  }
}
