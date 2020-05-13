import React, { useState, useEffect, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import DeltaDialog, { DeltaDialogBody, DeltaDialogContent } from './DeltaDialog'
import contactsStore, { contactsStoreState } from '../../stores/contacts'

import { ContactList2 } from '../contact/ContactList'
import { ScreenContext } from '../../contexts'
import { DialogProps } from '.'

export default function UnblockContacts(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const { isOpen, onClose } = props
  const [blockedContacts, setBlockedContacts] = useState(null)
  const [hadBlockedContacts, setHadBlockedContacts] = useState(null)
  const screenContext = useContext(ScreenContext)

  const onContactsUpdate = ({ blockedContacts }: contactsStoreState) => {
    if (hadBlockedContacts === null)
      setHadBlockedContacts(blockedContacts.length !== 0)
    setBlockedContacts(blockedContacts)
  }
  useEffect(() => {
    contactsStore.subscribe(onContactsUpdate)
    DeltaBackend.call('updateBlockedContacts')
    return () => contactsStore.unsubscribe(onContactsUpdate)
  }, [])

  const blockContact = (id: number) => {
    contactsStore.dispatch({ type: 'UI_UNBLOCK_CONTACT', payload: id })
  }
  const onUnblockContact = ({ id }: { id: number }) => {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
      cb: (yes: boolean) => yes && blockContact(id),
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
        <DeltaDialogContent>
          {blockedContacts.length === 0 && <p>{tx('none_blocked_desktop')}</p>}
          {blockedContacts.length > 0 && (
            <div
              style={{
                overflow: 'scroll',
                height: '100%',
                backgroundColor: 'var(--bp3DialogBgPrimary)',
              }}
            >
              <ContactList2
                contacts={blockedContacts}
                onClick={onUnblockContact}
              />
            </div>
          )}
        </DeltaDialogContent>
      </DeltaDialogBody>
    </DeltaDialog>
  )
}
