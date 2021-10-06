import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ContactListItem } from './ContactListItem'
import { DeltaBackend } from '../../delta-remote'
import { JsonContact } from '../../../shared/shared-types'
import { debounce } from 'debounce'
import { useInitEffect } from '../helpers/useInitEffect'
import { debounceWithInit } from '../chat/ChatListHelpers'

export function ContactList2(props: {
  contacts: JsonContact[]
  onClick?: (contact: JsonContact) => void
  showCheckbox?: boolean
  isChecked?: (contact: JsonContact) => boolean
  onCheckboxClick?: (contact: JsonContact) => void
  showRemove?: boolean
  onRemoveClick?: (contact: JsonContact) => void
}) {
  const {
    contacts,
    onClick,
    showCheckbox,
    isChecked,
    onCheckboxClick,
    showRemove,
    onRemoveClick,
  } = props
  return (
    <div>
      {contacts.map(contact => {
        let checked = null
        if (showCheckbox && typeof isChecked === 'function') {
          checked = isChecked(contact)
        }
        return ContactListItem({
          contact,
          onClick,
          showCheckbox,
          checked,
          onCheckboxClick,
          showRemove,
          onRemoveClick,
        })
      })}
    </div>
  )
}

export function useContacts(listFlags: number, queryStr: string) {
  const [contacts, setContacts] = useState<JsonContact[]>([])

  const debouncedGetContacts2 = useMemo(
    () =>
      debounce((listFlags: number, queryStr: string) => {
        DeltaBackend.call('getContacts2', listFlags, queryStr).then(setContacts)
      }, 200),
    []
  )
  const updateContacts = (queryStr: string) =>
    debouncedGetContacts2(listFlags, queryStr)

  useInitEffect(() => {
    DeltaBackend.call('getContacts2', listFlags, queryStr).then(setContacts)
  })

  return [contacts, updateContacts] as [typeof contacts, typeof updateContacts]
}

export function useContactsNew(listFlags: number, initialQueryStr: string) {
  const [state, setState] = useState<{
    contacts: JsonContact[]
    queryStrIsValidEmail: boolean
  }>({ contacts: [], queryStrIsValidEmail: false })

  const debouncedGetContacts2 = useMemo(
    () =>
      debounceWithInit(async (listFlags: number, queryStr: string) => {
        const contacts = await DeltaBackend.call(
          'getContacts2',
          listFlags,
          queryStr
        )
        const queryStrIsValidEmail = await DeltaBackend.call(
          'checkValidEmail',
          queryStr
        )
        setState({ contacts, queryStrIsValidEmail })
      }, 200),
    []
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

export function useContactIds(listFlags: number, queryStr: string) {
  const [state, setState] = useState<{
    contactIds: number[]
    queryStrIsValidEmail: boolean
  }>({ contactIds: [], queryStrIsValidEmail: false })

  const debouncedGetContactsIds = useMemo(
    () =>
      debounce(async (listFlags: number, queryStr: string) => {
        const contactIds = await DeltaBackend.call(
          'contacts.getContactIds',
          listFlags,
          queryStr
        )
        const queryStrIsValidEmail = await DeltaBackend.call(
          'checkValidEmail',
          queryStr
        )
        setState({ contactIds, queryStrIsValidEmail })
      }, 200),
    [setState]
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
