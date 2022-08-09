import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ContactListItem } from './ContactListItem'
import { DeltaBackend } from '../../delta-remote'
import { JsonContact } from '../../../shared/shared-types'
import { debounce } from 'debounce'
import { useInitEffect } from '../helpers/hooks'
import { debounceWithInit } from '../chat/ChatListHelpers'
import { Backend } from '../../backend'

export function ContactList2(props: {
  contacts: JsonContact[]
  onClick?: (contact: JsonContact) => void
  showCheckbox?: boolean
  isChecked?: (contact: JsonContact) => boolean
  onCheckboxClick?: (contact: JsonContact) => void
  showRemove?: boolean
  onRemoveClick?: (contact: JsonContact) => void
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

async function getAndSetContacts(
  listFlags: number,
  queryStr: string,
  setContacts: (a: Map<number, JsonContact>) => void
) {
  const contactArrayToMap = (contactArray: JsonContact[]) => {
    return new Map(
      contactArray.map((contact: JsonContact) => {
        return [contact.id, contact]
      })
    )
  }
  const contactArray = await DeltaBackend.call(
    'getContacts2',
    listFlags,
    queryStr
  )
  setContacts(contactArrayToMap(contactArray))
}

export function useContactsMap(listFlags: number, queryStr: string) {
  const [contacts, setContacts] = useState<Map<number, JsonContact>>(new Map())

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
        const queryStrIsValidEmail = await Backend.checkEmailValidity(
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

export function useContactIds(listFlags: number, queryStr: string | undefined) {
  const [state, setState] = useState<{
    contactIds: number[]
    queryStrIsValidEmail: boolean
  }>({ contactIds: [], queryStrIsValidEmail: false })

  const debouncedGetContactsIds = useMemo(
    () =>
      debounce(async (listFlags: number, queryStr: string | undefined) => {
        const contactIds = await DeltaBackend.call(
          'contacts.getContactIds',
          listFlags,
          queryStr || ''
        )
        const queryStrIsValidEmail = await Backend.checkEmailValidity(
          queryStr || ''
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
