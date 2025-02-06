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
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/components/screens/WelcomScreen')

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}

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
   * but also if the dialog is closed by pressing esc multiple
   * times, which will force Chrome to close the dialog
   * see https://issues.chromium.org/issues/346597066
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
