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

  const tx = useTranslationFunction()

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
          <FooterActionButton onClick={onClose}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
