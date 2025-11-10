import React, { useState, useEffect, useRef } from 'react'
import { throttle } from '@deltachat-desktop/shared/util'

import { ContactList } from '../contact/ContactList'
import { BackendRemote, onDCEvent, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { DialogBody, DialogContent, DialogWithHeader } from '../Dialog'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { RovingTabindexProvider } from '../../contexts/RovingTabindex'

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
      throttle(onContactsUpdate, 500)
    )
  }, [accountId])

  const onUnblockContact = async ({ id }: { id: number }) => {
    const confirmed = await openConfirmationDialog({
      message: tx('ask_unblock_contact'),
      confirmLabel: tx('menu_unblock_contact'),
    })

    if (confirmed) {
      await BackendRemote.rpc.unblockContact(accountId, id)
    }
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  if (blockedContacts === null) return null
  return (
    <DialogWithHeader
      fixed
      onClose={onClose}
      title={tx('pref_blocked_contacts')}
    >
      <DialogBody>
        <DialogContent className='blocked-contacts'>
          {blockedContacts.length === 0 && <p>{tx('blocked_empty_hint')}</p>}
          {blockedContacts.length > 0 && (
            <div ref={wrapperRef}>
              <RovingTabindexProvider wrapperElementRef={wrapperRef}>
                <ContactList
                  contacts={blockedContacts}
                  onClick={onUnblockContact}
                />
              </RovingTabindexProvider>
            </div>
          )}
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}
