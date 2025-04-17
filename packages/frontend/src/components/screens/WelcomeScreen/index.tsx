import React, { useLayoutEffect, useState } from 'react'

import Dialog from '../../Dialog'
import ImageBackdrop from '../../ImageBackdrop'
import InstantOnboardingScreen from './InstantOnboardingScreen'
import OnboardingScreen from './OnboardingScreen'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import { getConfiguredAccounts } from '../../../backend/account'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import useDialog from '../../../hooks/dialog/useDialog'
import AlertDialog from '../../dialogs/AlertDialog'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}

/**
 * Welcomescreen is shown to users when they start the app
 * for the first time or when they have no configured accounts
 */

export default function WelcomeScreen({ selectedAccountId, ...props }: Props) {
  const {
    resetInstantOnboarding,
    showInstantOnboarding,
    startInstantOnboardingFlow,
  } = useInstantOnboarding()
  const [hasConfiguredAccounts, setHasConfiguredAccounts] = useState(false)
  const { openDialog } = useDialog()
  const showBackButton = hasConfiguredAccounts

  useLayoutEffect(() => {
    // Show back button when user has already created and configured accounts.
    // On a fresh DC start we will not have any yet.
    const checkAccounts = async () => {
      const accounts = await getConfiguredAccounts()
      if (accounts.length > 0) {
        setHasConfiguredAccounts(true)
      }
    }

    checkAccounts()
  }, [])

  /**
   * this function is called when the back button is clicked
   *
   * it will cancel the account creation process and call
   * onExitWelcomeScreen
   */
  const onClickBackButton = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(selectedAccountId)
      if (acInfo.kind === 'Unconfigured') {
        await props.onUnSelectAccount()
        await EffectfulBackendActions.removeAccount(selectedAccountId)
      }
      props.onExitWelcomeScreen()
    } catch (error) {
      openDialog(AlertDialog, {
        message: unknownErrorToString(error),
        cb: () => {},
      })
    }
  }

  return (
    <ImageBackdrop variant='welcome'>
      <Dialog
        fixed
        width={400}
        canEscapeKeyClose={false}
        backdropDragAreaOnTauriRuntime
        canOutsideClickClose={false}
        onClose={onClickBackButton}
        dataTestid='onboarding-dialog'
      >
        {!showInstantOnboarding ? (
          <OnboardingScreen
            onNextStep={() => startInstantOnboardingFlow()}
            selectedAccountId={selectedAccountId}
            showBackButton={showBackButton}
            hasConfiguredAccounts={hasConfiguredAccounts}
            onClickBackButton={onClickBackButton}
            {...props}
          />
        ) : (
          <InstantOnboardingScreen
            selectedAccountId={selectedAccountId}
            onCancel={() => resetInstantOnboarding()}
          />
        )}
      </Dialog>
    </ImageBackdrop>
  )
}
