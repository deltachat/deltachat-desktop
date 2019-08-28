import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import SearchableList from '../SearchableList'
import { RenderContact } from '../Contact'
import contactsStore from '../../stores/contacts'
import { callDcMethod } from '../../ipc'
import Contact, { PseudoContact } from './Contact'

const ContactListDiv = styled.div`
  .module-contact-list-item--with-click-handler {
    padding: 10px;
  }
  .module-contact-list-item--with-click-handler:hover {
    background-color: darkgrey;
  }
`

export function useContacts (listFlags, queryStr) {
  const [contacts, setContacts] = useState([])

  const updateContacts = (listFlags, queryStr) => {
    callDcMethod('getContacts', [listFlags, queryStr])
  }

  const assignContacts = ({ contacts }) => setContacts(contacts)
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

const ContactListItemWrapper = styled.div`
  padding-left: ${({ showInitial }) => showInitial === true ? '0px' : '40px'};
  &:hover {
    background-color: var(--chatListItemBgHover)
  }
`

const ContactListItemInitial = styled.div`
  width: 40px;
  height: 64px;
  float: left;
  text-align: center;
  font-size: 26px;
  padding-top: 23px;
  text-transform: capitalize;
  color: var(--contactListInitalColor);
`
export function ContactListItem (props) {
  const { contact, showInitial, onClick } = props
  return (
    <ContactListItemWrapper
      key={contact.id}
      showInitial={showInitial}
      onClick={() => onClick(contact)}
    >
      {showInitial &&
      <ContactListItemInitial>
        {contact.displayName[0]}
      </ContactListItemInitial> }
      <Contact contact={contact} />
    </ContactListItemWrapper>
  )
}

export function PseudoContactListItem (props) {
  const { id, cutoff, text, onClick } = props
  return (
    <ContactListItemWrapper
      key={id}
      showInitial={false}
      onClick={onClick}
    >
      <PseudoContact cutoff={cutoff} text={text} />
    </ContactListItemWrapper>
  )
}

export function ContactList2 (props) {
  const { contacts, onClick } = props
  let currInitial = ''
  return contacts.map(contact => {
    const initial = contact.displayName[0].toLowerCase()
    let showInitial = false
    if (initial !== currInitial) {
      currInitial = initial
      showInitial = true
    }

    return ContactListItem({ contact, onClick, showInitial })
  })
}
