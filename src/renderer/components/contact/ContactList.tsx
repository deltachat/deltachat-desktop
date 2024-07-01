import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ContactListItem } from './ContactListItem'
import { debounce } from 'debounce'
import { useInitEffect } from '../helpers/hooks'
import { debounceWithInit } from '../chat/ChatListHelpers'
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
  } = props
  return (
    <div>
      {contacts.map(contact => {
        let checked = false
        if (showCheckbox && typeof isChecked === 'function') {
          checked = isChecked(contact)
        }
        let disabled = false
        if (disabledContacts !== undefined) {
          disabled = disabledContacts.indexOf(contact.id) !== -1
        }
        return ContactListItem({
          contact,
          onClick,
          showCheckbox: showCheckbox || false,
          checked,
          onCheckboxClick,
          showRemove: showRemove || false,
          onRemoveClick,
          disabled,
          onContextMenu: onContactContextMenu?.bind(null, contact),
        })
      })}
    </div>
  )
}

export function useContacts(listFlags: number, queryStr: string) {
  const [contacts, setContacts] = useState<Type.Contact[]>([])
  const accountId = selectedAccountId()

  const debouncedGetContacts2 = useMemo(
    () =>
      debounce((listFlags: number, queryStr: string) => {
        BackendRemote.rpc
          .getContacts(accountId, listFlags, queryStr)
          .then(setContacts)
      }, 200),
    [accountId]
  )
  const updateContacts = (queryStr: string) =>
    debouncedGetContacts2(listFlags, queryStr)

  useInitEffect(() => {
    BackendRemote.rpc
      .getContacts(accountId, listFlags, queryStr)
      .then(setContacts)
  })

  return [contacts, updateContacts] as [typeof contacts, typeof updateContacts]
}

async function getAndSetContacts(
  listFlags: number,
  queryStr: string,
  setContacts: (a: Map<number, Type.Contact>) => void
) {
  const accountId = selectedAccountId()
  const contactArrayToMap = (contactArray: Type.Contact[]) => {
    return new Map(
      contactArray.map((contact: Type.Contact) => {
        return [contact.id, contact]
      })
    )
  }
  const contactArray = await BackendRemote.rpc.getContacts(
    accountId,
    listFlags,
    queryStr
  )
  setContacts(contactArrayToMap(contactArray))
}

export function useContactsMap(listFlags: number, queryStr: string) {
  const [contacts, setContacts] = useState<Map<number, Type.Contact>>(new Map())

  const debouncedGetContacts = useMemo(
    () =>
      debounce((listFlags: number, queryStr: string) => {
        getAndSetContacts(listFlags, queryStr, setContacts)
      }, 200),
    []
  )
  const updateContacts = (queryStr: string) =>
    debouncedGetContacts(listFlags, queryStr)

  useInitEffect(() => {
    getAndSetContacts(listFlags, queryStr, setContacts)
  })

  return [contacts, updateContacts] as [typeof contacts, typeof updateContacts]
}

// The queryStr is trimmed for contact search and for checking validity of the string as an Email address
export function useContactsNew(listFlags: number, initialQueryStr: string) {
  const [state, setState] = useState<{
    contacts: Type.Contact[]
    queryStrIsValidEmail: boolean
  }>({ contacts: [], queryStrIsValidEmail: false })
  const accountId = selectedAccountId()

  const debouncedGetContacts2 = useMemo(
    () =>
      debounceWithInit(async (listFlags: number, queryStr: string) => {
        const contacts = await BackendRemote.rpc.getContacts(
          accountId,
          listFlags,
          queryStr.trim()
        )
        const queryStrIsValidEmail = await BackendRemote.rpc.checkEmailValidity(
          queryStr.trim()
        )
        setState({ contacts, queryStrIsValidEmail })
      }, 200),
    [accountId]
  )

  const search = useCallback(
    (queryStr: string) => {
      debouncedGetContacts2(listFlags, queryStr)
    },
    [listFlags, debouncedGetContacts2]
  )

  useEffect(
    () => debouncedGetContacts2(listFlags, initialQueryStr),
    [listFlags, initialQueryStr, debouncedGetContacts2]
  )

  return [state, search] as [typeof state, typeof search]
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
        const contactIds = await BackendRemote.rpc.getContactIds(
          accountId,
          listFlags,
          queryStr?.trim() || null
        )
        const queryStrIsValidEmail = await BackendRemote.rpc.checkEmailValidity(
          queryStr?.trim() || ''
        )
        setState({ contactIds, queryStrIsValidEmail })
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
