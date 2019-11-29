import React, { useState, useEffect, useContext } from 'react'
import { callDcMethod } from '../../ipc'
import { Classes } from '@blueprintjs/core'
import DeltaDialog, { 
  DeltaDialogBody,
  DeltaDialogCard,
  DeltaDialogFooter,
  DeltaDialogCardInnerWithoutPadding
} from './DeltaDialog'
import contactsStore from '../../stores/contacts'
import { Card, Spinner } from '@blueprintjs/core'
import { ContactList2 } from '../contact/ContactList'
import ScreenContext from '../../contexts/ScreenContext'

export default function UnblockContacts (props) {
  const { isOpen, onClose } = props
  const [blockedContacts, setBlockedContacts] = useState(null)
  const screenContext = useContext(ScreenContext)

  const onContactsUpdate = ({blockedContacts}) => setBlockedContacts(blockedContacts)
  useEffect(() => {
    contactsStore.subscribe(onContactsUpdate)
    callDcMethod('updateBlockedContacts')
    return () => contactsStore.unsubscribe(onContactsUpdate)
  }, [])

  const blockContact = id => {
    contactsStore.dispatch({ type: 'UI_UNBLOCK_CONTACT', payload: id}) 
  }
  const onUnblockContact = ({ id }) => {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_unblock_contact'),
      cb: yes => yes && blockContact(id)
    })
  }
  console.log(blockedContacts)


  const tx = window.translate
  return (
    <DeltaDialog
      isOpen={isOpen}
      onClose={onClose}
      title={tx('unblock_contacts_desktop')}
      fixed
    >
      <DeltaDialogBody>
        <DeltaDialogCard>
          { blockedContacts === null && <Spinner/> }
          { blockedContacts !== null && blockedContacts.length === 0 &&
            <p>{tx('none_blocked_desktop')}</p>
          }
          { blockedContacts !== null && blockedContacts.length > 0 &&
            <DeltaDialogCardInnerWithoutPadding>
              <div style={{overflow: 'scroll', height: '100%', backgroundColor:'var(--bp3DialogBgPrimary)'}}>
                <ContactList2
                  contacts={blockedContacts}
                  showRemove
                  onClick={onUnblockContact}
                  onRemoveClick={onUnblockContact}
                />
              </div>
            </DeltaDialogCardInnerWithoutPadding>
          }
        </DeltaDialogCard>
      </DeltaDialogBody>
    </DeltaDialog>
  )
}
