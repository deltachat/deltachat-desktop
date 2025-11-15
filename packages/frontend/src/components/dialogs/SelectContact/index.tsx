import React, { useEffect, useRef, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import styles from './styles.module.scss'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import type { T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../../contexts/DialogContext'
import { useLazyLoadedContacts } from '../../contact/ContactList'
import { ContactListItem } from '../../contact/ContactListItem'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'

/**
 * display a dialog with a react-window of contacts
 * and pass it to provided onOk function immediately
 * after one contact is selected (clicked)
 *
 * TODO: this is a a adjusted copy of CreateChat dialog,
 * we should provide one generic list of contacts components
 * with some configurable extensions
 */
export default function SelectContactDialog({
  onOk,
  onClose,
}: {
  onOk: (contact: T.Contact) => void
} & DialogProps) {
  const [queryStr, setQueryStr] = useState('')
  const { contactIds, contactCache, loadContacts, isContactLoaded } =
    useLazyLoadedContacts(C.DC_GCL_ADD_SELF, queryStr)
  const tx = useTranslationFunction()

  const selectContactListRef = useRef<HTMLDivElement>(null)

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
    // `contactIds`) for some performance, but let's play it safe.
  })

  return (
    <Dialog width={400} onClose={onClose} fixed>
      <DialogHeader onClose={onClose}>
        <input
          data-no-drag-region
          className='search-input'
          onChange={e => setQueryStr(e.target.value)}
          value={queryStr}
          placeholder={tx('search')}
          autoFocus
          spellCheck={false}
        />
      </DialogHeader>
      <DialogBody className={styles.selectContactDialogBody}>
        <div className={styles.selectContactList} ref={selectContactListRef}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <InfiniteLoader
                ref={infiniteLoaderRef}
                itemCount={contactIds.length}
                loadMoreItems={loadContacts}
                isItemLoaded={isContactLoaded}
                // minimumBatchSize={100}
              >
                {({ onItemsRendered, ref }) => (
                  <RovingTabindexProvider
                    wrapperElementRef={selectContactListRef}
                  >
                    <FixedSizeList
                      innerElementType={'ol'}
                      className='react-window-list-reset'
                      itemCount={contactIds.length}
                      itemData={{
                        onContactClick: onOk,
                        contactIds,
                        contactCache,
                      }}
                      itemKey={index => contactIds[index]}
                      onItemsRendered={onItemsRendered}
                      ref={ref}
                      height={height}
                      width='100%'
                      itemSize={64}
                    >
                      {/* Remember that the renderer function
                      must not be defined _inline_.
                      Otherwise when the component re-renders,
                      item elements get replaces with fresh ones,
                      and we lose focus.
                      See https://github.com/bvaughn/react-window/issues/420#issuecomment-585813335 */}
                      {SelectContactDialogRow}
                    </FixedSizeList>
                  </RovingTabindexProvider>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      </DialogBody>
    </Dialog>
  )
}

function SelectContactDialogRow({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    onContactClick: (contact: T.Contact) => void
    contactIds: Array<T.Contact['id']>
    contactCache: ReturnType<typeof useLazyLoadedContacts>['contactCache']
  }
}) {
  const { onContactClick, contactIds, contactCache } = data

  const item = contactCache[contactIds[index]]
  if (!item) {
    // It's not loaded yet
    return <li style={style}></li>
  }

  const contact: T.Contact = item
  return (
    <ContactListItem
      tagName='li'
      style={style}
      contact={contact}
      onClick={onContactClick}
      showCheckbox={false}
      checked={false}
      showRemove={false}
    />
  )
}
