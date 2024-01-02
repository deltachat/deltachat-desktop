import { debounce } from 'debounce'
import React, { useEffect, useState } from 'react'

import {
  BackendRemote,
  EffectfulBackendActions,
  onDCEvent,
} from '../../backend-com'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../ScreenController'
import { ContactList } from '../contact/ContactList'
import { DialogBody, DialogContent, DialogWithHeader } from '../Dialog'

import type { Type } from '../../backend-com'
import type { DialogProps } from '../../contexts/DialogContext'

export default function UnblockContacts({ onClose }: DialogProps) {
  const [blockedContacts, setBlockedContacts] = useState<Type.Contact[] | null>(
    null
  )
  const accountId = selectedAccountId()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

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

  const onUnblockContact = async ({ id }: { id: number }) => {
    const confirmed = await openConfirmationDialog({
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
    })

    if (confirmed) {
      EffectfulBackendActions.unBlockContact(accountId, id)
    }
  }

  if (blockedContacts === null) return null
  return (
    <DialogWithHeader
      fixed
      onClose={onClose}
      title={tx('pref_blocked_contacts')}
    >
      <DialogBody>
        <DialogContent>
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
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}
