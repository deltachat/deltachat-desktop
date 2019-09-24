import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import SearchableList from '../SearchableList'
import { RenderContact } from '../Contact'
import { callDcMethod } from '../../ipc'
import Contact, { PseudoContact } from './Contact'
import debounce from 'debounce'
import { ContactListItem } from './ContactListItem'

const ContactListDiv = styled.div`
  .module-contact-list-item--with-click-handler {
    padding: 10px;
  }
  .module-contact-list-item--with-click-handler:hover {
    background-color: darkgrey;
  }
`

export function ContactList2 (props) {
  const { contacts, onClick, showCheckbox, isChecked, onCheckboxClick } = props
  return contacts.map(contact => {
    let checked = null
    if (showCheckbox && typeof isChecked === 'function') {
      checked = isChecked(contact)
    }
    return ContactListItem({ contact, onClick, showCheckbox, checked, onCheckboxClick })
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
  callDcMethod('getContacts2', [listFlags, queryStr], cb)
}, 200)

export function useContacts (listFlags, queryStr) {
  const [contacts, setContacts] = useState([])

  const updateContacts = queryStr => debouncedGetContacts2(listFlags, queryStr, setContacts)

  useEffect(() => {
    callDcMethod('getContacts2', [listFlags, queryStr], setContacts)
  }, [])

  return [contacts, updateContacts]
}

export default class ContactList extends SearchableList {
  constructor (props) {
    super(props)
    this.state.showVerifiedContacts = false
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
  }

  _getData () {
    const { filterFunction, contacts } = this.props
    if (!contacts || contacts.length === 0) {
      return []
    }
    let data = contacts
    if (filterFunction) {
      data = contacts.filter(filterFunction)
    }
    data = data.filter(contact =>
      `${contact.name}${contact.address}${contact.displayName}`.indexOf(this.state.queryStr) !== -1
    )
    if (this.props.showVerifiedContacts) {
      data = data.filter(contact => contact.isVerified)
    }
    return data
  }

  render () {
    return <ContactListDiv>
      {super.render()}
    </ContactListDiv>
  }

  renderItem (contact) {
    const { childProps, onContactClick } = this.props
    const props = childProps ? childProps(contact) : {}
    return <RenderContact
      key={contact.id}
      onClick={() => onContactClick(contact)}
      contact={contact}
      {...props}
    />
  }
}
