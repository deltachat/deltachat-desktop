import React, { useState, useEffect, useContext } from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogContent } from './DeltaDialog'

import { ContactList } from '../contact/ContactList'
import { ScreenContext } from '../../contexts'
import { DialogProps } from './DialogController'
import debounce from 'debounce'
import {
  BackendRemote,
  EffectfulBackendActions,
  onDCEvent,
  Type,
} from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export default function UnblockContacts(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const { isOpen, onClose } = props
  const [blockedContacts, setBlockedContacts] = useState<Type.Contact[] | null>(
    null
  )
  const screenContext = useContext(ScreenContext)
  const accountId = selectedAccountId()

  useEffect(() => {
    const onContactsUpdate = async () => {
      setBlockedContacts(await BackendRemote.rpc.getBlockedContacts(accountId))
    }
    onContactsUpdate()
    return onDCEvent(
      accountId,
      'ContactsChanged',
      debounce(onContactsUpdate, 500)
    )
  }, [accountId])

  const onUnblockContact = ({ id }: { id: number }) => {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
      cb: (yes: boolean) =>
        yes && EffectfulBackendActions.unBlockContact(accountId, id),
    })
  }

  const tx = window.static_translate
  if (blockedContacts === null) return null
  return (
    <DeltaDialog
      isOpen={isOpen}
      onClose={onClose}
      title={tx('pref_blocked_contacts')}
      fixed={true}
    >
      <DeltaDialogBody>
        <DeltaDialogContent>
          {blockedContacts.length === 0 && <p>{tx('blocked_empty_hint')}</p>}
          {blockedContacts.length > 0 && (
            <div
              style={{
                overflow: 'scroll',
                height: '100%',
                backgroundColor: 'var(--bp4DialogBgPrimary)',
              }}
            >
              <ContactList
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
