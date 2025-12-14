import React, { useState, useEffect } from 'react'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { useSettingsStore } from '../../stores/settings'

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

  const tx = useTranslationFunction()

  if (!settings) {
    throw new Error('settings store missing')
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={tx('encryption_info_title_desktop')}
        onClose={onClose}
      />
      <DialogBody>
        <DialogContent paddingTop>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {!encryptionInfo && 'Fetching...'}
            {encryptionInfo && encryptionInfo}
          </p>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
