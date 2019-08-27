import React, { Fragment, useState, useEffect, useContext } from 'react'
import SmallDialog, { DeltaButton } from '../helpers/SmallDialog'
import styled, { createGlobalStyle } from 'styled-components'
import ContactList, { useContacts } from '../helpers/ContactList'
import contactsStore from '../../stores/contacts'
import ScreenContext from '../../contexts/ScreenContext'
import { Classes, Dialog } from '@blueprintjs/core'
import { callDcMethodAsync } from '../../ipc'

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

const CreateDeltaDialogGlobal = createGlobalStyle`
    .DeltaDialog {
        position: absolute;
        top: 0;
    }
`

export function DeltaDialog(props) {
  return (
    <Fragment>
      <CreateDeltaDialogGlobal/>
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        className='DeltaDialog'
      >
        <div className='bp3-dialog-header'>
          <h4 className='bp3-heading'>{props.title}</h4>
          <button onClick={props.onClose} aria-label='Close' className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross' />
        </div>
        {props.children}
      </Dialog>
    </Fragment>
  )
}

export default function CreateChat (props) {
  const { isOpen, onClose } = props
  const tx = window.translate
  const { changeScreen, userFeedback } = useContext(ScreenContext)
  
  const [contacts, updateContacts] = useContacts(0, '')

  const chooseContact = async (contact) => {
    const chatId = await callDcMethodAsync('createChatByContactId', contact.id)

    if (!chatId) {
      return userFeedback({ type: 'error', text: tx('create_chat_error_desktop')})
    }
    changeScreen('ChatView', { chatId })
    onClose()
  }

  const title = "test"
  return (
    <DeltaDialog
      isOpen={isOpen}
      onClose={onClose}
      className='SettingsDialog'
      title='Test'
    >
      <div className={Classes.DIALOG_BODY}>
        <ContactList
          contacts={contacts}
          onContactClick={chooseContact.bind(this)}
        />
      </div>
      <div className={Classes.DIALOG_FOOTER} />
    </DeltaDialog>
  )
}
