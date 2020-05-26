import React, { useState, useEffect } from 'react'
import debounce from 'debounce'
import { ContactListItem } from './ContactListItem'
import { DeltaBackend } from '../../delta-remote'
import { DCContact } from '../../../shared/shared-types'

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

const debouncedGetContacts2 = debounce(
  (listFlags: number, queryStr: string, cb: (value: DCContact[]) => void) => {
    DeltaBackend.call('getContacts2', listFlags, queryStr).then(cb)
  },
  200
)

export function useContacts(listFlags: number, queryStr: string) {
  const [contacts, setContacts] = useState<DCContact[]>([])

  const updateContacts = (queryStr: string) =>
    debouncedGetContacts2(listFlags, queryStr, setContacts)

  useEffect(() => {
    DeltaBackend.call('getContacts2', listFlags, queryStr).then(setContacts)
  }, [])

  return [contacts, updateContacts] as [typeof contacts, typeof updateContacts]
}

const debouncedGetContactsIds = debounce(
  (listFlags: number, queryStr: string, cb: (value: number[]) => void) => {
    DeltaBackend.call('contacts.getContactIds', listFlags, queryStr).then(cb)
  },
  200
)

export function useContactIds(listFlags: number, queryStr: string) {
  const [contactIds, setContacts] = useState<number[]>([])

  const updateContacts = (queryStr: string) =>
    debouncedGetContactsIds(listFlags, queryStr, setContacts)

  useEffect(() => {
    DeltaBackend.call('contacts.getContactIds', listFlags, queryStr).then(
      setContacts
    )
  }, [])

  return [contactIds, updateContacts] as [
    typeof contactIds,
    typeof updateContacts
  ]
}
