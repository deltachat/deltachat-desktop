import React from 'react'
import { Spinner } from '@blueprintjs/core'

import Dialog, {
  DialogBody,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from './Dialog'
import useTranslationFunction from '../hooks/useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { selectedAccountId } from '../ScreenController'

import type { DialogProps } from '../contexts/DialogContext'

type Props = { onCancel?: () => void }

export default function ProcessQrCodeDialog({
  onCancel,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const handleCancel = async () => {
    if (accountId) {
      await BackendRemote.rpc.stopOngoingProcess(accountId)
    }

    onCancel && onCancel()
    onClose()
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <Spinner />
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={handleCancel}>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
