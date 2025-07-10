import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ContactListItem } from './ContactListItem'
import { debounce } from 'debounce'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

/**
 * Make sure not to render all of the user's contacts with this component.
 * Some users might have thousands of contacts, which can result in
 * this component taking seconds to render.
 * Instead consider using 'react-window', like we do in the `CreateChat`
 * component.
 */
export function ContactList(props: {
  contacts: Type.Contact[]
  onClick?: (contact: Type.Contact) => void
  showCheckbox?: boolean
  isChecked?: (contact: Type.Contact) => boolean
  onCheckboxClick?: (contact: Type.Contact) => void
  showRemove?: boolean
  onRemoveClick?: (contact: Type.Contact) => void
  disabledContacts?: number[]
  onContactContextMenu?: (contact: Type.Contact) => void
  olElementAttrs?: Omit<React.HTMLAttributes<HTMLOListElement>, 'style'>
}) {
  const {
    contacts,
    onClick,
    showCheckbox,
    isChecked,
    onCheckboxClick,
    showRemove,
    onRemoveClick,
    disabledContacts,
    onContactContextMenu,
    olElementAttrs,
  } = props
  return (
    <ol
      {...olElementAttrs}
      style={{ margin: 0, padding: 0, listStyle: 'none' }}
    >
      {contacts.map(contact => {
        let checked = false
        if (showCheckbox && typeof isChecked === 'function') {
          checked = isChecked(contact)
        }
        let disabled = false
        if (disabledContacts !== undefined) {
          disabled = disabledContacts.indexOf(contact.id) !== -1
        }
        return (
          <ContactListItem
            tagName='li'
            key={contact.id}
            contact={contact}
            onClick={onClick}
            showCheckbox={showCheckbox || false}
            checked={checked}
            onCheckboxClick={onCheckboxClick}
            showRemove={showRemove || false}
            onRemoveClick={onRemoveClick}
            disabled={disabled}
            onContextMenu={onContactContextMenu?.bind(null, contact)}
          />
        )
      })}
    </ol>
  )
}

/**
 * Why not just `BackendRemote.rpc.getContacts()`?
 * Because if the user has thousands of contacts (which does happen),
 * `BackendRemote.rpc.getContacts()` can take a few seconds.
 * `BackendRemote.rpc.getContactIds()` is much faster
 * Same for rendering all contacts at the same time,
 * see {@link ContactList} docsting
 * See https://github.com/deltachat/deltachat-desktop/issues/1830#issuecomment-2122549915
 */
export function useLazyLoadedContacts(
  listFlags: number,
  queryStr: string | undefined
) {
  const accountId = selectedAccountId()
  const { contactIds, queryStrIsValidEmail, refresh } = useContactIds(
    listFlags,
    queryStr
  )

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

  const isContactLoaded: (index: number) => boolean = index =>
    !!contactLoadState[contactIds[index]]
  const loadContacts: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void> = async (startIndex, stopIndex) => {
    const ids = contactIds.slice(startIndex, stopIndex + 1)

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
    contactIds,
    isContactLoaded,
    loadContacts,
    contactCache,

    queryStrIsValidEmail,

    /** Useful when e.g. a contact got deleted or added. */
    refresh,
  }
}

function useContactIds(listFlags: number, queryStr: string | undefined) {
  const accountId = selectedAccountId()
  const [state, setState] = useState<{
    contactIds: number[]
    queryStrIsValidEmail: boolean
  }>({ contactIds: [], queryStrIsValidEmail: false })

  const debouncedGetContactsIds = useMemo(
    () =>
      debounce(async (listFlags: number, queryStr: string | undefined) => {
        const contactIdsP = BackendRemote.rpc.getContactIds(
          accountId,
          listFlags,
          queryStr?.trim() || null
        )
        const queryStrIsValidEmailP = BackendRemote.rpc.checkEmailValidity(
          queryStr?.trim() || ''
        )
        setState({
          contactIds: await contactIdsP,
          queryStrIsValidEmail: await queryStrIsValidEmailP,
        })
      }, 200),
    [setState, accountId]
  )

  const init = useRef(false)

  useEffect(() => {
    debouncedGetContactsIds(listFlags, queryStr)
    if (!init.current) {
      // make sure that contact fetching isn't delayed on first run
      debouncedGetContactsIds.flush()
      init.current = true
    }
  }, [debouncedGetContactsIds, listFlags, queryStr])

  const refresh = () => {
    debouncedGetContactsIds(listFlags, queryStr)
    debouncedGetContactsIds.flush()
  }

  return {
    ...state,
    /** Useful when e.g. a contact got deleted or added. */
    refresh,
  }
}
