import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import SearchableList from '../SearchableList'
import { RenderContact } from '../Contact'
import contactsStore from '../../stores/contacts'
import { callDcMethod } from '../../ipc'

const ContactListDiv = styled.div`
  .module-contact-list-item--with-click-handler {
    padding: 10px;
  }
  .module-contact-list-item--with-click-handler:hover {
    background-color: darkgrey;
  }
`

export function useContacts(listFlags, queryStr) {
  const [contacts, setContacts] = useState([])

  const updateContacts = (listFlags, queryStr) => {
      callDcMethod('getContacts', [listFlags, queryStr])
  }
    
  const assignContacts = ({contacts}) => setContacts(contacts)
  useEffect(() => {
    contactsStore.subscribe(assignContacts)
    updateContacts(listFlags, queryStr)
    return () => contactsStore.unsubscribe(assignContacts)
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
    return <ContactListDiv>{super.render()}</ContactListDiv>
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
