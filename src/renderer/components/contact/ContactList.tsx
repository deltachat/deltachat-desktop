import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ContactListItem } from './ContactListItem'
import { DeltaBackend } from '../../delta-remote'
import { DCContact } from '../../../shared/shared-types'
import { debounce } from 'debounce'
import { useInitEffect } from '../helpers/useInitEffect'

export function ContactList2(props: {
  contacts: DCContact[]
  onClick?: (contact: DCContact) => void
  showCheckbox?: boolean
  isChecked?: (contact: DCContact) => boolean
  onCheckboxClick?: (contact: DCContact) => void
  showRemove?: boolean
  onRemoveClick?: (contact: DCContact) => void
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
  const [contacts, setContacts] = useState<DCContact[]>([])

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

export function useContactIds(listFlags: number, queryStr: string) {
  const [contactIds, setContacts] = useState<number[]>([])

  const debouncedGetContactsIds = useMemo(
    () =>
      debounce((listFlags: number, queryStr: string) => {
        DeltaBackend.call('contacts.getContactIds', listFlags, queryStr).then(
          setContacts
        )
      }, 200),
    [setContacts]
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

  return contactIds
}
