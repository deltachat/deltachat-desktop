import React, { Fragment, useState, useEffect, useContext } from 'react'
import SmallDialog, { DeltaButton } from '../helpers/SmallDialog'
import styled, { createGlobalStyle } from 'styled-components'
import { useContacts, ContactList2, ContactListItem, PseudoContactListItem } from '../helpers/ContactList'
import ScreenContext from '../../contexts/ScreenContext'
import { Card, Classes, Dialog } from '@blueprintjs/core'
import { callDcMethodAsync } from '../../ipc'
import classNames from 'classnames'

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
        className={classNames('DeltaDialog', props.className)}
        style={props.style}
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

const CreateChatContactListWrapper = styled.div`
  background-color: var(--bp3DialogBgPrimary);
`

export default function CreateChat (props) {
  const { isOpen, onClose } = props
  const tx = window.translate
  const { changeScreen, userFeedback } = useContext(ScreenContext)
  
  const [contacts, updateContacts] = useContacts(0, '')

  const chooseContact = async ({id}) => {
    const chatId = await callDcMethodAsync('createChatByContactId', id)

    if (!chatId) {
      return userFeedback({ type: 'error', text: tx('create_chat_error_desktop')})
    }
    onClose()
    changeScreen('ChatView', { chatId })
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

  const title = "test"
  return (
    <DeltaDialog
      isOpen={isOpen}
      onClose={onClose}
      title='Test'
      style={{width: '400px'}}
    >
      <div className={Classes.DIALOG_BODY}>
        <CreateChatContactListWrapper>
          {renderOnEmptySearch()}
          
          <ContactList2 contacts={contacts} onClick={chooseContact} /> 
        </CreateChatContactListWrapper>
      </div>
      <div className={Classes.DIALOG_FOOTER} />
    </DeltaDialog>
  )
}
