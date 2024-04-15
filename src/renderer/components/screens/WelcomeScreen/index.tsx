import React, { useEffect, useState } from 'react'

import AlertDialog from '../../dialogs/AlertDialog'
import AlternativeSetupsDialog from './AlternativeSetupsDialog'
import Button from '../../Button'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import ImportQrCode from '../../dialogs/ImportQrCode'
import useDialog from '../../../hooks/dialog/useDialog'
import useProcessQr from '../../../hooks/useProcessQr'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import { getLogger } from '../../../../shared/logger'

// import styles from './styles.module.scss'

const log = getLogger('renderer/components/AccountsScreen')

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}

export default function WelcomeScreen({
  selectedAccountId,
  onUnSelectAccount,
  onExitWelcomeScreen,
}: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const processQr = useProcessQr()
  const [showBackButton, setShowBackButton] = useState(false)

  const onAlreadyHaveAccount = () => {
    openDialog(AlternativeSetupsDialog)
  }

  const onScanQRCode = () => {
    openDialog(ImportQrCode, { subtitle: tx('qrscan_hint') })
  }

  const onCancel = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(selectedAccountId)
      if (acInfo.kind === 'Unconfigured') {
        await onUnSelectAccount()
        await EffectfulBackendActions.removeAccount(selectedAccountId)
      }
      onExitWelcomeScreen()
    } catch (error) {
      if (error instanceof Error) {
        openDialog(AlertDialog, {
          message: error?.message,
          cb: () => {},
        })
      } else {
        log.error('unexpected error type', error)
        throw error
      }
    }
  }

  useEffect(() => {
    // Show back button when user has already created and configured accounts.
    // On a fresh DC start we will not have any yet.
    const checkAccounts = async () => {
      const accounts = await BackendRemote.listAccounts()
      if (accounts && accounts.length > 1) {
        setShowBackButton(true)
      }
    }

    // "callback" when opening dclogin or dcaccount from an already existing
    // account, the app needs to switch to the welcome screen first.
    const checkQRCode = async () => {
      if (!window.__welcome_qr) {
        return
      }
      await processQr(selectedAccountId, window.__welcome_qr, undefined, true)
      window.__welcome_qr = undefined
    }

    checkAccounts()
    checkQRCode()
  }, [processQr, selectedAccountId])

  return (
    <Dialog canEscapeKeyClose fixed onClose={() => {}} width={400}>
      <DialogHeader
        onClickBack={showBackButton ? onCancel : undefined}
        title={tx('add_account')}
      />
      <DialogBody>
        <Button type='secondary' onClick={onScanQRCode}>
          {tx('scan_invitation_code')}
        </Button>
        <Button type='secondary' onClick={onAlreadyHaveAccount}>
          I already have an account
        </Button>
      </DialogBody>
    </Dialog>
  )
}
