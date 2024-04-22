import React, { useLayoutEffect, useState } from 'react'

import AlertDialog from '../../dialogs/AlertDialog'
import AlternativeSetupsDialog from './AlternativeSetupsDialog'
import Button from '../../Button'
import ImportQrCode from '../../dialogs/ImportQrCode'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import { getLogger } from '../../../../shared/logger'

import styles from './styles.module.scss'

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
  onNextStep: () => void
}

const log = getLogger('renderer/components/OnboardingScreen')

export default function OnboardingScreen(props: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const [showBackButton, setShowBackButton] = useState(false)

  const onAlreadyHaveAccount = () => {
    openDialog(AlternativeSetupsDialog)
  }

  const onScanQRCode = () => {
    openDialog(ImportQrCode, { subtitle: tx('qrscan_hint') })
  }

  useLayoutEffect(() => {
    // Show back button when user has already created and configured accounts.
    // On a fresh DC start we will not have any yet.
    const checkAccounts = async () => {
      const accounts = await BackendRemote.listAccounts()
      if (accounts && accounts.length > 1) {
        setShowBackButton(true)
      }
    }

    checkAccounts()
  }, [])

  const onClickBackButton = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(
        props.selectedAccountId
      )
      if (acInfo.kind === 'Unconfigured') {
        await props.onUnSelectAccount()
        await EffectfulBackendActions.removeAccount(props.selectedAccountId)
      }

      props.onExitWelcomeScreen()
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

  return (
    <>
      <DialogHeader
        onClickBack={showBackButton ? onClickBackButton : undefined}
        title={tx('onboarding_title')}
      />
      <DialogBody>
        <DialogContent>
          <img
            className={styles.welcomeScreenImage}
            src='../images/intro1.png'
          />
          <p className={styles.welcomeScreenTitle}>
            {tx('onboarding_subtitle')}
          </p>
          <div className={styles.welcomeScreenButtonGroup}>
            <Button
              className={styles.welcomeScreenButton}
              type='primary'
              onClick={props.onNextStep}
            >
              {tx('onboarding_create_instant_account')}
            </Button>
            <Button
              className={styles.welcomeScreenButton}
              type='secondary'
              onClick={onScanQRCode}
            >
              {tx('onboarding_scan_qr_code')}
            </Button>
            <Button
              className={styles.welcomeScreenButton}
              type='secondary'
              onClick={onAlreadyHaveAccount}
            >
              {tx('onboarding_alternative_logins')}
            </Button>
          </div>
        </DialogContent>
      </DialogBody>
    </>
  )
}
