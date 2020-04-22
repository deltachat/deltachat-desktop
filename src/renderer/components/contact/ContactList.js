import { useState, useEffect } from 'react'
import styled from 'styled-components'
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

export const ContactListSearchInput = styled.input`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  margin: 0;
  line-height: inherit;
  border: 0px;
  margin-left: 20px;
  font-size: 18px;
`

const debouncedGetContacts2 = debounce((listFlags, queryStr, cb) => {
  callDcMethodAsync('getContacts2', [listFlags, queryStr]).then(cb)
}, 200)

export function useContacts(listFlags, queryStr) {
  const [contacts, setContacts] = useState([])

  const updateContacts = queryStr =>
    debouncedGetContacts2(listFlags, queryStr, setContacts)

  useEffect(() => {
    callDcMethodAsync('getContacts2', [listFlags, queryStr]).then(setContacts)
  }, [])

  return [contacts, updateContacts]
}
