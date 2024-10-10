import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { C } from '@deltachat/jsonrpc-client'
import type { T } from '@deltachat/jsonrpc-client'
import { PseudoListItemAddContact } from '../../helpers/PseudoListItem'
import { ContactListItem } from '../../contact/ContactListItem'
import { BackendRemote, onDCEvent, Type } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { DialogBody, DialogHeader, OkCancelFooterAction } from '../../Dialog'
import useDialog from '../../../hooks/dialog/useDialog'
import { VerifiedContactsRequiredDialog } from '../ProtectionStatusDialog'
import InfiniteLoader from 'react-window-infinite-loader'
import { AddMemberChip } from './AddMemberDialog'
import styles from './styles.module.scss'
import { I18nContext } from '../../../contexts/I18nContext'

export function AddMemberInnerDialog({
  onCancel,
  onOk,
  onSearchChange,
  queryStr,
  queryStrIsValidEmail,

  contactIds,
  contactCache,
  loadContacts,
  refreshContacts,

  groupMembers,
  isBroadcast = false,
  isVerificationRequired = false,
}: {
  onOk: (addMembers: number[]) => void
  onCancel: Parameters<typeof OkCancelFooterAction>[0]['onCancel']
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  queryStr: string
  queryStrIsValidEmail: boolean

  contactIds: number[]
  contactCache: { [id: number]: T.Contact | undefined }
  loadContacts: (startIndex: number, stopIndex: number) => Promise<void>
  refreshContacts: () => void

  groupMembers: number[]
  isBroadcast: boolean
  isVerificationRequired: boolean
}) {
  const { tx, writingDirection } = useContext(I18nContext)
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()
  const contactIdsInGroup: number[] = contactIds.filter(contactId =>
    groupMembers.includes(contactId)
  )
  const [contactIdsToAdd, setContactIdsToAdd] = useState<Type.Contact[]>([])

  useEffect(
    () =>
      onDCEvent(accountId, 'ContactsChanged', () => {
        refreshContacts()
      }),
    [accountId, refreshContacts]
  )

  const [contactsToDeleteOnCancel, setContactsToDeleteOnCancel] = useState<
    number[]
  >([])

  const addMember = useCallback(
    (contact: Type.Contact) => {
      if (isVerificationRequired && !contact.isVerified) {
        openDialog(VerifiedContactsRequiredDialog)
        return
      }

      setContactIdsToAdd([...contactIdsToAdd, contact])
    },
    [contactIdsToAdd, isVerificationRequired, openDialog]
  )

  const removeMember = useCallback(
    (contact: Type.Contact) => {
      setContactIdsToAdd(contactIdsToAdd.filter(c => c.id !== contact.id))
    },
    [contactIdsToAdd]
  )

  const toggleMember = useCallback(
    (contact: Type.Contact) => {
      if (!contactIdsToAdd.find(c => c.id === contact.id)) {
        addMember(contact)
      } else {
        removeMember(contact)
      }
    },
    [addMember, contactIdsToAdd, removeMember]
  )

  const createNewContact = useCallback(async () => {
    if (!queryStrIsValidEmail) return

    const contactId = await BackendRemote.rpc.createContact(
      accountId,
      queryStr.trim(),
      null
    )
    const contact = await BackendRemote.rpc.getContact(accountId, contactId)
    toggleMember(contact)
    setContactsToDeleteOnCancel(value => [...value, contactId])
    onSearchChange({
      target: { value: '' },
    } as ChangeEvent<HTMLInputElement>)
  }, [accountId, toggleMember, onSearchChange, queryStr, queryStrIsValidEmail])

  const _onOk = () => {
    if (contactIdsToAdd.length === 0) {
      return
    }

    onOk(contactIdsToAdd.map(member => member.id))
  }

  const _onCancel = async () => {
    await Promise.all(
      contactsToDeleteOnCancel.map(contactId =>
        BackendRemote.rpc.deleteContact(selectedAccountId(), contactId)
      )
    )
    onCancel()
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const contactListRef = useRef<HTMLDivElement>(null)
  const applyCSSHacks = () => {
    setTimeout(() => inputRef.current?.focus(), 0)

    const offsetHeight = document.querySelector('.AddMemberChipsWrapper') //@ts-ignore
      ?.offsetHeight
    if (!offsetHeight) return
    contactListRef.current?.style.setProperty(
      'max-height',
      `calc(100% - ${offsetHeight}px)`
    )
  }

  useLayoutEffect(applyCSSHacks, [inputRef, contactIdsToAdd])
  useEffect(applyCSSHacks, [])

  const needToRenderAddContact = queryStr !== '' && contactIds.length === 0
  const itemCount = contactIds.length + (needToRenderAddContact ? 1 : 0)
  const renderAddContact = () => {
    if (queryStrIsValidEmail) {
      const pseudoContact: Type.Contact = {
        address: queryStr,
        color: 'lightgrey',
        authName: '',
        status: '',
        displayName: queryStr,
        id: -1,
        lastSeen: -1,
        name: queryStr,
        profileImage: '',
        nameAndAddr: '',
        isBlocked: false,
        isVerified: false,
        verifierId: null,
        wasSeenRecently: false,
        isProfileVerified: false,
        isBot: false,
        e2eeAvail: false,
      }
      return (
        <ContactListItem
          contact={pseudoContact}
          showCheckbox={true}
          checked={false}
          showRemove={false}
          onCheckboxClick={createNewContact}
        />
      )
    } else {
      return (
        <PseudoListItemAddContact
          queryStr={queryStr}
          queryStrIsEmail={false}
          onClick={() => {}}
        />
      )
    }
  }

  const addContactOnKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.code == 'Enter') {
      ;(
        document.querySelector<HTMLDivElement>(
          '.delta-checkbox'
        ) as HTMLDivElement
      ).click()
    }
  }

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
    <>
      <DialogHeader
        title={!isBroadcast ? tx('group_add_members') : tx('add_recipients')}
      />
      <DialogBody className={styles.addMemberDialogBody}>
        <div className={styles.AddMemberChipsWrapper}>
          <div className={styles.AddMemberChips}>
            {contactIdsToAdd.map(contact => {
              return AddMemberChip({
                contact,
                onRemoveClick: toggleMember,
              })
            })}
            <input
              ref={inputRef}
              className={'search-input ' + styles.groupMemberSearch}
              onChange={onSearchChange}
              onKeyDown={event => {
                addContactOnKeyDown(event)
              }}
              value={queryStr}
              placeholder={tx('search')}
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>
        <div className={styles.addMemberContactList} ref={contactListRef}>
          <AutoSizer disableWidth>
            {({ height }) => (
              <InfiniteLoader
                ref={infiniteLoaderRef}
                itemCount={itemCount}
                // Careful, keep in mind that the rendered array is not the same as
                // contactIds, `InfiniteLoader` must not call `loadContacts`
                // with wrong indices.
                // See `CreateChatMain` component.
                loadMoreItems={loadContacts}
                // perf: consider using `isContactLoaded` from `useLazyLoadedContacts`
                // otherwise sometimes we might load the same contact twice (performance thing)
                // See https://github.com/bvaughn/react-window/issues/765
                isItemLoaded={index => {
                  const isExtraItem = index >= contactIds.length
                  return isExtraItem
                    ? true
                    : contactCache[contactIds[index]] != undefined
                }}
                // minimumBatchSize={100}
              >
                {({ onItemsRendered, ref }) => (
                  // Not using 'react-window' results in ~5 second rendering time
                  // if the user has 5000 contacts.
                  // (see https://github.com/deltachat/deltachat-desktop/issues/1830)
                  <FixedSizeList
                    itemData={contactIds}
                    itemCount={itemCount}
                    itemKey={(index, contactIds) => {
                      const isExtraItem = index >= contactIds.length
                      return isExtraItem ? 'addContact' : contactIds[index]
                    }}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    height={height}
                    width='100%'
                    // TODO fix: The size of each item is determined
                    // by `--local-avatar-size` and `--local-avatar-vertical-margin`,
                    // which might be different, e.g. currently they're smaller for
                    // "Rocket Theme", which results in gaps between the elements.
                    itemSize={64}
                    direction={writingDirection}
                  >
                    {({ index, style, data: contactIds }) => {
                      const isExtraItem = index >= contactIds.length
                      if (isExtraItem) {
                        return renderAddContact()
                      }

                      const contact = contactCache[contactIds[index]]
                      if (!contact) {
                        // Not loaded yet
                        return <div style={style}></div>
                      }

                      return (
                        <div style={style}>
                          <ContactListItem
                            contact={contact}
                            showCheckbox
                            checked={
                              contactIdsToAdd.some(c => c.id === contact.id) ||
                              contactIdsInGroup.includes(contact.id)
                            }
                            disabled={
                              contactIdsInGroup.includes(contact.id) ||
                              contact.id === C.DC_CONTACT_ID_SELF
                            }
                            onCheckboxClick={toggleMember}
                            showRemove={false}
                          />
                        </div>
                      )
                    }}
                  </FixedSizeList>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      </DialogBody>
      <OkCancelFooterAction
        onCancel={_onCancel}
        onOk={_onOk}
        disableOK={contactIdsToAdd.length === 0 ? true : false}
      />
    </>
  )
}
