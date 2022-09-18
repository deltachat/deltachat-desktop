import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ContactListItem } from './ContactListItem'
import { debounce } from 'debounce'
import { useInitEffect } from '../helpers/hooks'
import { debounceWithInit } from '../chat/ChatListHelpers'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export function ContactList2(props: {
  contacts: Type.Contact[]
  onClick?: (contact: Type.Contact) => void
  showCheckbox?: boolean
  isChecked?: (contact: Type.Contact) => boolean
  onCheckboxClick?: (contact: Type.Contact) => void
  showRemove?: boolean
  onRemoveClick?: (contact: Type.Contact) => void
  disabledContacts?: number[]
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
          .contactsGetContacts(accountId, listFlags, queryStr)
          .then(setContacts)
      }, 200),
    [accountId]
  )
  const updateContacts = (queryStr: string) =>
    debouncedGetContacts2(listFlags, queryStr)

  useInitEffect(() => {
    BackendRemote.rpc
      .contactsGetContacts(accountId, listFlags, queryStr)
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
  const contactArray = await BackendRemote.rpc.contactsGetContacts(
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

export function useContactsNew(listFlags: number, initialQueryStr: string) {
  const [state, setState] = useState<{
    contacts: Type.Contact[]
    queryStrIsValidEmail: boolean
  }>({ contacts: [], queryStrIsValidEmail: false })
  const accountId = selectedAccountId()

  const debouncedGetContacts2 = useMemo(
    () =>
      debounceWithInit(async (listFlags: number, queryStr: string) => {
        const contacts = await BackendRemote.rpc.contactsGetContacts(
          accountId,
          listFlags,
          queryStr
        )
        const queryStrIsValidEmail = await BackendRemote.rpc.checkEmailValidity(
          queryStr
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

  useEffect(() => debouncedGetContacts2(listFlags, initialQueryStr), [
    listFlags,
    initialQueryStr,
    debouncedGetContacts2,
  ])

  return [state, search] as [typeof state, typeof search]
}

export function useContactIds(listFlags: number, queryStr: string | undefined) {
  const accountId = selectedAccountId()
  const [state, setState] = useState<{
    contactIds: number[]
    queryStrIsValidEmail: boolean
  }>({ contactIds: [], queryStrIsValidEmail: false })

  const debouncedGetContactsIds = useMemo(
    () =>
      debounce(async (listFlags: number, queryStr: string | undefined) => {
        const contactIds = await BackendRemote.rpc.contactsGetContactIds(
          accountId,
          listFlags,
          queryStr || null
        )
        const queryStrIsValidEmail = await BackendRemote.rpc.checkEmailValidity(
          queryStr || ''
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

  return state
}
