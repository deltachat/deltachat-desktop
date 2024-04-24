import React from 'react'

import AlertDialog from '../../dialogs/AlertDialog'
import AlternativeSetupsDialog from './AlternativeSetupsDialog'
import Button from '../../Button'
import QrScanButton from './QrScanButton'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import { getLogger } from '../../../../shared/logger'

import styles from './styles.module.scss'

type Props = {
  onExitWelcomeScreen: () => Promise<void>
  onNextStep: () => void
  onUnSelectAccount: () => Promise<void>
  selectedAccountId: number
  showBackButton: boolean
}

const log = getLogger('renderer/components/OnboardingScreen')

export default function OnboardingScreen(props: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onAlreadyHaveAccount = () => {
    openDialog(AlternativeSetupsDialog)
  }

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
        onClickBack={props.showBackButton ? onClickBackButton : undefined}
        title={tx('welcome_desktop')}
      >
        <QrScanButton />
      </DialogHeader>
      <DialogBody>
        <DialogContent>
          <img
            className={styles.welcomeScreenImage}
            src='../images/intro1.png'
          />
          <p className={styles.welcomeScreenTitle}>
            {tx('welcome_chat_over_email')}
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
