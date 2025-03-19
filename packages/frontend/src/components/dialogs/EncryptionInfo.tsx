import React, { useState, useEffect } from 'react'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { useSettingsStore } from '../../stores/settings'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'

export type Props = {
  chatId: number | null
  dmChatContact: number | null
}

export function EncryptionInfo({
  chatId,
  dmChatContact,
  onClose,
}: Props & DialogProps) {
  const [encryptionInfo, setEncryptionInfo] = useState('Fetching...')
  useEffect(() => {
    if (dmChatContact == null && chatId == null) return
    ;(dmChatContact != null
      ? BackendRemote.rpc.getContactEncryptionInfo(
          selectedAccountId(),
          dmChatContact
        )
      : BackendRemote.rpc.getChatEncryptionInfo(
          selectedAccountId(),
          chatId as number
        )
    ).then(setEncryptionInfo)
  }, [dmChatContact, chatId])
  const settings = useSettingsStore()[0]
  const openConfirmationDialog = useConfirmationDialog()

  const tx = useTranslationFunction()

  if (!settings) {
    throw new Error('settings store missing')
  }

  const isChatmail = settings?.settings.is_chatmail === '1'
  const accountId = settings?.accountId
  const onResetEncryption = async () => {
    if (!dmChatContact) {
      throw new Error('contact id missing')
    }
    if (
      await openConfirmationDialog({
        header: tx('reset_encryption'),
        message: tx('reset_encryption_confirm'),
      })
    ) {
      await BackendRemote.rpc.resetContactEncryption(accountId, dmChatContact)
      setEncryptionInfo(
        await BackendRemote.rpc.getContactEncryptionInfo(
          selectedAccountId(),
          dmChatContact
        )
      )
    }
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {!encryptionInfo && 'Fetching...'}
            {encryptionInfo && encryptionInfo}
          </p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          {dmChatContact && !isChatmail && (
            <FooterActionButton onClick={onResetEncryption} styling='secondary'>
              {tx('reset_encryption')}
            </FooterActionButton>
          )}
          <FooterActionButton styling='primary' onClick={onClose}>
            {tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
