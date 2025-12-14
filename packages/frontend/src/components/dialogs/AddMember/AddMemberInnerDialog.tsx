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
import InfiniteLoader from 'react-window-infinite-loader'
import { AddMemberChip } from './AddMemberDialog'
import styles from './styles.module.scss'
import classNames from 'classnames'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'
import { I18nContext } from '../../../contexts/I18nContext'

export function AddMemberInnerDialog({
  onCancel,
  onOk,
  onSearchChange,
  queryStr,
  queryStrIsValidEmail,

  contactIds,
  contactCache,
  isContactLoaded,
  loadContacts,
  refreshContacts,

  groupMembers,
  titleMembersOrRecipients,
  allowAddManually,
}: {
  onOk: (addMembers: number[]) => void
  onCancel: Parameters<typeof OkCancelFooterAction>[0]['onCancel']
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  queryStr: string
  queryStrIsValidEmail: boolean

  contactIds: number[]
  contactCache: { [id: number]: T.Contact | undefined }
  isContactLoaded: (index: number) => boolean
  loadContacts: (startIndex: number, stopIndex: number) => Promise<void>
  refreshContacts: () => void

  groupMembers: number[]
  titleMembersOrRecipients: 'members' | 'recipients'
  allowAddManually: boolean
}) {
  const { tx, writingDirection } = useContext(I18nContext)
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
      setContactIdsToAdd([...contactIdsToAdd, contact])
    },
    [contactIdsToAdd]
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

    const el = document.querySelector(
      '.AddMemberChipsWrapper'
    ) as HTMLElement | null
    const offsetHeight = el?.offsetHeight
    if (!offsetHeight) return
    contactListRef.current?.style.setProperty(
      'max-height',
      `calc(100% - ${offsetHeight}px)`
    )
  }

  useLayoutEffect(applyCSSHacks, [inputRef, contactIdsToAdd])
  useEffect(applyCSSHacks, [])

  const showAddContactManually =
    queryStr !== '' && contactIds.length === 0 && allowAddManually
  const itemCount = contactIds.length + (showAddContactManually ? 1 : 0)

  const addContactOnKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      // TODO refactor: this is fragile.
      ;(
        contactListRef.current?.querySelector(
          'input[type="checkbox"]'
        ) as HTMLDivElement
      ).click()
    } else if (ev.code === 'ArrowDown') {
      ;(contactListRef.current?.querySelector('button') as HTMLElement)?.focus()
      // prevent scrolling down the list
      ev.preventDefault()
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
        title={
          titleMembersOrRecipients === 'members'
            ? tx('group_add_members')
            : tx('add_recipients')
        }
      />
      <DialogBody className={styles.addMemberDialogBody}>
        <div className={styles.AddMemberChipsWrapper}>
          <div className={styles.AddMemberChips}>
            {contactIdsToAdd.map(contact => {
              return (
                <AddMemberChip
                  key={contact.id}
                  contact={contact}
                  onRemoveClick={toggleMember}
                />
              )
            })}
            <input
              ref={inputRef}
              className={classNames('search-input', styles.groupMemberSearch)}
              onChange={onSearchChange}
              onKeyDown={event => {
                addContactOnKeyDown(event)
              }}
              value={queryStr}
              placeholder={tx('search')}
              autoFocus
              spellCheck={false}
              data-testid='add-member-search'
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
                isItemLoaded={index => {
                  const isExtraItem = index >= contactIds.length
                  return isExtraItem ? true : isContactLoaded(index)
                }}
                // minimumBatchSize={100}
              >
                {({ onItemsRendered, ref }) => (
                  <RovingTabindexProvider wrapperElementRef={contactListRef}>
                    {/* Not using 'react-window' results in ~5 second rendering time
                    if the user has 5000 contacts.
                    (see https://github.com/deltachat/deltachat-desktop/issues/1830) */}
                    <FixedSizeList
                      innerElementType={'ol'}
                      className='react-window-list-reset'
                      itemData={{
                        contactIds,
                        contactIdsInGroup,
                        contactIdsToAdd,
                        contactCache,
                        onCheckboxClick: toggleMember,
                        onCreateContactCheckboxClick: createNewContact,
                        queryStr,
                        queryStrIsValidEmail,
                      }}
                      itemCount={itemCount}
                      itemKey={(index, { contactIds }) => {
                        const isExtraItem = index >= contactIds.length
                        return isExtraItem ? 'addContact' : contactIds[index]
                      }}
                      onItemsRendered={onItemsRendered}
                      direction={writingDirection}
                      ref={ref}
                      height={height}
                      width='100%'
                      // TODO fix: The size of each item is determined
                      // by `--local-avatar-size` and `--local-avatar-vertical-margin`,
                      // which might be different, e.g. currently they're smaller for
                      // "Rocket Theme", which results in gaps between the elements.
                      itemSize={64}
                    >
                      {/* Remember that the renderer function
                      must not be defined _inline_.
                      Otherwise when the component re-renders,
                      item elements get replaces with fresh ones,
                      and we lose focus.
                      See https://github.com/bvaughn/react-window/issues/420#issuecomment-585813335 */}
                      {AddMemberInnerDialogRow}
                    </FixedSizeList>
                  </RovingTabindexProvider>
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

function AddMemberInnerDialogRow({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    contactIds: Array<T.Contact['id']>
    contactIdsInGroup: Array<T.Contact['id']>
    contactIdsToAdd: Type.Contact[]
    contactCache: Parameters<typeof AddMemberInnerDialog>[0]['contactCache']
    onCheckboxClick: (contact: T.Contact) => void
    onCreateContactCheckboxClick: (contact: T.Contact) => void
    queryStr: string
    queryStrIsValidEmail: boolean
  }
}) {
  const {
    contactIds,
    contactIdsInGroup,
    contactIdsToAdd,
    contactCache,
    onCheckboxClick,
    onCreateContactCheckboxClick,
    queryStr,
    queryStrIsValidEmail,
  } = data

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
        isBot: false,
        e2eeAvail: false,
        isKeyContact: false,
      }
      return (
        <ContactListItem
          tagName='li'
          style={style}
          contact={pseudoContact}
          showCheckbox={true}
          checked={false}
          showRemove={false}
          onCheckboxClick={onCreateContactCheckboxClick}
          data-testid='add-pseudo-contact'
        />
      )
    } else {
      return (
        <li style={style}>
          <PseudoListItemAddContact
            queryStr={queryStr}
            queryStrIsEmail={false}
            onClick={undefined}
          />
        </li>
      )
    }
  }
  const isExtraItem = index >= contactIds.length
  if (isExtraItem) {
    return renderAddContact()
  }

  const contact = contactCache[contactIds[index]]
  if (!contact) {
    // Not loaded yet
    return <li style={style}></li>
  }

  return (
    <ContactListItem
      tagName='li'
      style={style}
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
      onCheckboxClick={onCheckboxClick}
      showRemove={false}
    />
  )
}
