import React, { Fragment, useState, useEffect, useContext } from 'react'
import SmallDialog, { DeltaButton } from '../helpers/SmallDialog'
import styled, { createGlobalStyle } from 'styled-components'
import { useContacts, ContactList2, ContactListItem, PseudoContactListItem } from '../helpers/ContactList'
import ScreenContext from '../../contexts/ScreenContext'
import { Card, Classes, Dialog } from '@blueprintjs/core'
import { callDcMethodAsync } from '../../ipc'
import classNames from 'classnames'
import { DeltaDialogBase, DeltaDialogCloseButton } from '../helpers/DeltaDialog'

const OvalDeltaButton = styled.button`
  background-color: ${props => props.theme.ovalButtonBg};
  padding: 10px;
  border-style: none;
  border-radius: 180px;
  margin: 10px;
  font-weight: bold;
  color: ${props => props.theme.ovalButtonText};
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${props => props.theme.ovalButtonBgHover};
    color: ${props => props.theme.ovalButtonTextHover};
  }
`

const CreateChatContactListWrapper = styled.div`
  background-color: var(--bp3DialogBgPrimary);
`


export default function CreateChat (props) {
  const { isOpen, onClose } = props
  const tx = window.translate
  const { changeScreen, userFeedback } = useContext(ScreenContext)

  const [queryStr, setQueryStr] = useState('')
  const [contacts, updateContacts] = useContacts(0, queryStr)
  
  const closeDialogAndSelectChat = chatId => { 
    onClose()
    changeScreen('ChatView', { chatId })
  }

  const chooseContact = async ({ id }) => {
    const chatId = await callDcMethodAsync('createChatByContactId', id)

    if (!chatId) {
      return userFeedback({ type: 'error', text: tx('create_chat_error_desktop') })
    }
    closeDialogAndSelectChat(chatId)
  }


  const onSearchChange = event => {
    let queryStr = event.target.value
    setQueryStr(queryStr)
    updateContacts(0, queryStr)
  }

  const renderOnEmptySearch = () => {
    return (
      <Fragment>
        <PseudoContactListItem
          id='newgroup'
          cutoff='+'
          text={tx('menu_new_group')}
        />
        <PseudoContactListItem
          id='newverifiedgroup'
          cutoff='+'
          text={tx('menu_new_verified_group')}
        />
      </Fragment>
    )
  }
  
  const addContactOnClick = async () => {
    let queryStrIsEmail = isValidEmail(queryStr)
    if (!queryStrIsEmail) return
    
    const contactId = await callDcMethodAsync('createContact', [queryStr, queryStr])
    const chatId = await callDcMethodAsync('createChatByContactId', contactId)
    closeDialogAndSelectChat(chatId)
  }
  const renderAddContactIfNeeded = () => {
    if (queryStr === '' ||
        (contacts.length === 1 && contacts[0].address.toLowerCase() == queryStr.toLowerCase())) {
      return null
    }
    let queryStrIsEmail = isValidEmail(queryStr)
    return (
      <PseudoContactListItem
        id='newcontact'
        cutoff='+'
        text={tx('menu_new_contact')}
        subText={queryStrIsEmail ? queryStr + ' ...' : tx('contacts_type_email_above')}
        onClick={addContactOnClick}
      />
    )
  }

  const title = 'test'
  return (
     <DeltaDialogBase 
       isOpen={isOpen}
       onClose={onClose}
       style={{ width: '400px' }}
     >
        <div className='bp3-dialog-header'>
          <ContactSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('contacts_enter_name_or_email')} autoFocus />
          <DeltaDialogCloseButton onClick={onClose} />
        </div>
        <div className={Classes.DIALOG_BODY}>
          <CreateChatContactListWrapper>
            {queryStr === '' && renderOnEmptySearch()}
            <ContactList2 contacts={contacts} onClick={chooseContact} />
            {renderAddContactIfNeeded()}
          </CreateChatContactListWrapper>
        </div>
        <div className={Classes.DIALOG_FOOTER} />
     </DeltaDialogBase>
  )
}

function isValidEmail(email) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return true
  return false
}


const ContactSearchInput = styled.input`
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
