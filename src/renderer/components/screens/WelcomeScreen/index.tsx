import React, { useLayoutEffect, useState } from 'react'

import Dialog from '../../Dialog'
import ImageBackdrop from '../../ImageBackdrop'
import InstantOnboardingScreen from './InstantOnboardingScreen'
import OnboardingScreen from './OnboardingScreen'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import { getConfiguredAccounts } from '../../../backend/account'

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
  const [showBackButton, setShowBackButton] = useState(false)

  const onClose = () => {
    // Prevent user from closing dialog
  }

  useLayoutEffect(() => {
    // Show back button when user has already created and configured accounts.
    // On a fresh DC start we will not have any yet.
    const checkAccounts = async () => {
      const accounts = await getConfiguredAccounts()
      if (accounts.length > 0) {
        setShowBackButton(true)
      }
    }

    checkAccounts()
  }, [])

  return (
    <ImageBackdrop variant='welcome'>
      <Dialog fixed onClose={onClose} width={400}>
        {!showInstantOnboarding ? (
          <OnboardingScreen
            onNextStep={() => startInstantOnboardingFlow()}
            selectedAccountId={selectedAccountId}
            showBackButton={showBackButton}
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
