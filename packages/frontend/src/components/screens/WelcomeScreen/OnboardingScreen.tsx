import React from 'react'

import AlternativeSetupsDialog from './AlternativeSetupsDialog'
import Button from '../../Button'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { DialogBody, DialogContent, DialogHeader } from '../../Dialog'

import styles from './styles.module.scss'

type Props = {
  onExitWelcomeScreen: () => Promise<void>
  onNextStep: () => void
  onUnSelectAccount: () => Promise<void>
  onClose: () => Promise<void>
  selectedAccountId: number
  hasConfiguredAccounts: boolean
}

/**
 * Sub component of WelcomeScreen shows the choice
 * to create a new account or to use an existing one
 */

export default function OnboardingScreen(props: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onAlreadyHaveAccount = () => {
    openDialog(AlternativeSetupsDialog, {
      selectedAccountId: props.selectedAccountId,
    })
  }

  return (
    <>
      <DialogHeader
        onClose={props.hasConfiguredAccounts ? props.onClose : undefined}
        title={
          props.hasConfiguredAccounts
            ? tx('add_account')
            : tx('welcome_desktop')
        }
      />
      <DialogBody>
        <DialogContent>
          <div className={styles.welcomeScreenSection}>
            <img
              className={styles.welcomeScreenImage}
              src='./images/intro1.png'
            />
            <p className={styles.welcomeScreenTitle}>
              {tx('welcome_chat_over_email')}
            </p>
          </div>
          <div className={styles.welcomeScreenButtonGroup}>
            <Button
              className={styles.welcomeScreenButton}
              styling='primary'
              onClick={props.onNextStep}
              data-testid='create-account-button'
            >
              {tx('onboarding_create_instant_account')}
            </Button>
            <Button
              className={styles.welcomeScreenButton}
              styling='secondary'
              onClick={onAlreadyHaveAccount}
              data-testid='have-account-button'
            >
              {tx('onboarding_alternative_logins')}
            </Button>
          </div>
        </DialogContent>
      </DialogBody>
    </>
  )
}
