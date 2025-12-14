import React, { useState, useMemo, useRef } from 'react'
import { ContactListItem } from './ContactListItem'
import { default as asyncThrottle } from '@jcoreio/async-throttle'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { useFetch } from '../../hooks/useFetch'
import { getLogger } from '@deltachat-desktop/shared/logger'
import type { T } from '@deltachat/jsonrpc-client'

const log = getLogger('ContactList')

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
  const { contactIds, queryStrIsValidEmail, refreshContacts } = useContactIds(
    listFlags,
    queryStr
  )

  // TODO perf: shall we use Map instead of an object?
  // Or does it not matter since there is not going to be too many contacts?
  const [contactCache, setContactCache] = useState<{
    [id: number]: Type.Contact | undefined
  }>({})
  const loadingContacts = useRef(new Set<T.Contact['id']>()).current

  const isContactLoaded: (index: number) => boolean = index =>
    !!contactCache[contactIds[index]] || loadingContacts.has(contactIds[index])
  const loadContacts: (
    startIndex: number,
    stopIndex: number
  ) => Promise<void> = async (startIndex, stopIndex) => {
    const ids = contactIds.slice(startIndex, stopIndex + 1)

    for (const id of ids) {
      loadingContacts.add(id)
    }
    const contacts = await BackendRemote.rpc.getContactsByIds(accountId, ids)
    setContactCache(cache => ({ ...cache, ...contacts }))
    for (const id of ids) {
      loadingContacts.delete(id)
    }
  }

  return {
    contactIds,
    /**
     * This function is not reactive, i.e. it doesn't get re-created
     * when we start loading more items.
     */
    isContactLoaded,
    loadContacts,
    contactCache,

    queryStrIsValidEmail,

    /** Useful when e.g. a contact got deleted or added. */
    refreshContacts,
  }
}

function useContactIds(listFlags: number, queryStr: string | undefined) {
  const accountId = selectedAccountId()

  const trimmedQueryStr = queryStr?.trim()
  const contactIdsFetch = useFetch(
    useMemo(
      () =>
        asyncThrottle(
          BackendRemote.rpc.getContactIds.bind(BackendRemote.rpc),
          100
        ),
      []
    ),
    [accountId, listFlags, trimmedQueryStr || null]
  )
  if (contactIdsFetch.result?.ok === false) {
    log.error('Failed to fetch cotnact IDs', contactIdsFetch.result.err)
  }

  const queryStrMayBeValidEmail =
    trimmedQueryStr != undefined && trimmedQueryStr.length > 2
  const queryStrIsValidEmailFetch = useFetch(
    useMemo(
      () =>
        asyncThrottle(
          BackendRemote.rpc.checkEmailValidity.bind(BackendRemote.rpc),
          100
        ),
      []
    ),
    queryStrMayBeValidEmail ? [trimmedQueryStr] : null
  )
  if (queryStrIsValidEmailFetch?.result?.ok === false) {
    log.error(
      'Failed to checkEmailValidity',
      queryStrIsValidEmailFetch.result.err
    )
  }
  const queryStrIsValidEmail =
    (queryStrMayBeValidEmail &&
      queryStrIsValidEmailFetch?.lingeringResult?.ok &&
      queryStrIsValidEmailFetch.lingeringResult.value) ??
    false

  return {
    queryStrIsValidEmail,
    queryStrIsValidEmailFetch,

    contactIds: contactIdsFetch.lingeringResult?.ok
      ? contactIdsFetch.lingeringResult.value
      : [],
    contactsFetch: contactIdsFetch,
    /** Useful when e.g. a contact got deleted or added. */
    refreshContacts: contactIdsFetch.refresh,
  }
}
