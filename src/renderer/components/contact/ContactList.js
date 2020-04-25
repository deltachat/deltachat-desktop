import { useState, useEffect } from 'react'
import { callDcMethod } from '../../ipc'
import debounce from 'debounce'
import { ContactListItem } from './ContactListItem'

export function ContactList2(props) {
  const {
    contacts,
    onClick,
    showCheckbox,
    isChecked,
    onCheckboxClick,
    showRemove,
    onRemoveClick,
  } = props
  return contacts.map(contact => {
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
  })
}

const debouncedGetContacts2 = debounce((listFlags, queryStr, cb) => {
  DeltaBackend.call('getContacts2', listFlags, queryStr).then(cb)
}, 200)

export function useContacts(listFlags, queryStr) {
  const [contacts, setContacts] = useState([])

  const updateContacts = queryStr =>
    debouncedGetContacts2(listFlags, queryStr, setContacts)

  useEffect(() => {
    DeltaBackend.call('getContacts2', listFlags, queryStr).then(setContacts)
  }, [])

  return [contacts, updateContacts]
}
