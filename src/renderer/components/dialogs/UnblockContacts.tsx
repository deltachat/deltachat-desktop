import React, { useState, useEffect, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import DeltaDialog, { DeltaDialogBody, DeltaDialogContent } from './DeltaDialog'

import { ContactList2 } from '../contact/ContactList'
import { ScreenContext } from '../../contexts'
import { DialogProps } from './DialogController'
import { onDCEvent } from '../../ipc'
import { JsonContact } from '../../../shared/shared-types'
import debounce from 'debounce'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export default function UnblockContacts(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const { isOpen, onClose } = props
  const [blockedContacts, setBlockedContacts] = useState<JsonContact[] | null>(
    null
  )
  const screenContext = useContext(ScreenContext)

  useEffect(() => {
    const onContactsUpdate = async () => {
      const blockedContacts = await BackendRemote.rpc.contactsGetBlocked(
        selectedAccountId()
      )
      setBlockedContacts(blockedContacts)
    }
    onContactsUpdate()
    return onDCEvent(
      'DC_EVENT_CONTACTS_CHANGED',
      debounce(onContactsUpdate, 500)
    )
  }, [])

  const onUnblockContact = ({ id }: { id: number }) => {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
      cb: async (yes: boolean) =>
        yes &&
        (await BackendRemote.rpc.contactsUnblock(selectedAccountId(), id)),
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
