import React, { useEffect, useRef, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'
import Dialog, {
  DialogBody,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import styles from './styles.module.scss'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import type { T } from '@deltachat/jsonrpc-client'
import { DialogProps } from '../../../contexts/DialogContext'
import { useLazyLoadedContacts } from '../../contact/ContactList'
import { ContactListItem } from '../../contact/ContactListItem'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'

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
  const { contactIds, contactCache, loadContacts } = useLazyLoadedContacts(
    C.DC_GCL_ADD_SELF,
    queryStr
  )
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
    // `contactIds`) for some performance, but let's play it safe.
  })

  return (
    <Dialog width={400} onClose={onClose} fixed>
      <DialogHeader>
        <input
          className='search-input'
          onChange={e => setQueryStr(e.target.value)}
          value={queryStr}
          placeholder={tx('search')}
          autoFocus
          spellCheck={false}
        />
      </DialogHeader>
      <DialogBody className={styles.selectContactDialogBody}>
        <div className={styles.selectContactList}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <InfiniteLoader
                ref={infiniteLoaderRef}
                itemCount={contactIds.length}
                loadMoreItems={loadContacts}
                // perf: consider using `isContactLoaded` from `useLazyLoadedContacts`
                // otherwise sometimes we might load the same contact twice (performance thing)
                // See https://github.com/bvaughn/react-window/issues/765
                isItemLoaded={index =>
                  contactCache[contactIds[index]] != undefined
                }
                // minimumBatchSize={100}
              >
                {({ onItemsRendered, ref }) => (
                  <FixedSizeList
                    itemCount={contactIds.length}
                    itemKey={index => contactIds[index]}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    height={height}
                    width='100%'
                    itemSize={64}
                  >
                    {({ index, style }) => {
                      const el = (() => {
                        const item = contactCache[contactIds[index]]
                        if (!item) {
                          // It's not loaded yet
                          return null
                        }
                        const contact: T.Contact = item
                        return (
                          <ContactListItem
                            contact={contact}
                            onClick={onOk}
                            showCheckbox={false}
                            checked={false}
                            showRemove={false}
                          />
                        )
                      })()

                      return <div style={style}>{el}</div>
                    }}
                  </FixedSizeList>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClose}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
