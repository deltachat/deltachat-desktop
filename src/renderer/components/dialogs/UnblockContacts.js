import React, { useState, useEffect, useContext } from 'react'
import { callDcMethod } from '../../ipc'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogCard,
  DeltaDialogCardInnerWithoutPadding
} from './DeltaDialog'
import contactsStore from '../../stores/contacts'

import { ContactList2 } from '../contact/ContactList'
import ScreenContext from '../../contexts/ScreenContext'

export default function UnblockContacts (props) {
  const { isOpen, onClose } = props
  const [blockedContacts, setBlockedContacts] = useState(null)
  const [hadBlockedContacts, setHadBlockedContacts] = useState(null)
  const screenContext = useContext(ScreenContext)

  const onContactsUpdate = ({ blockedContacts }) => {
    if (hadBlockedContacts === null) setHadBlockedContacts(blockedContacts.length !== 0)
    setBlockedContacts(blockedContacts)
  }
  useEffect(() => {
    contactsStore.subscribe(onContactsUpdate)
    callDcMethod('updateBlockedContacts')
    return () => contactsStore.unsubscribe(onContactsUpdate)
  }, [])

  const blockContact = id => {
    contactsStore.dispatch({ type: 'UI_UNBLOCK_CONTACT', payload: id })
  }
  const onUnblockContact = ({ id }) => {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
      cb: yes => yes && blockContact(id)
    })
  }

  const tx = window.translate
  if (blockedContacts === null) return null
  return (
    <DeltaDialog
      isOpen={isOpen}
      onClose={onClose}
      title={tx('pref_blocked_contacts')}
      fixed={hadBlockedContacts === true}
    >
      <DeltaDialogBody>
        <DeltaDialogCard>
          { blockedContacts.length === 0 &&
            <p>{tx('none_blocked_desktop')}</p>
          }
          { blockedContacts.length > 0 &&
            <DeltaDialogCardInnerWithoutPadding>
              <div style={{ overflow: 'scroll', height: '100%', backgroundColor: 'var(--bp3DialogBgPrimary)' }}>
                <ContactList2
                  contacts={blockedContacts}
                  onClick={onUnblockContact}
                />
              </div>
            </DeltaDialogCardInnerWithoutPadding>
          }
        </DeltaDialogCard>
      </DeltaDialogBody>
    </DeltaDialog>
  )
}
