import React, { useLayoutEffect, useState } from 'react'

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
  const [hasConfiguredAccounts, setHasConfiguredAccounts] = useState(false)
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

  return (
    <ImageBackdrop variant='welcome'>
      {!showInstantOnboarding ? (
        <OnboardingScreen
          onNextStep={() => startInstantOnboardingFlow()}
          selectedAccountId={selectedAccountId}
          showBackButton={showBackButton}
          hasConfiguredAccounts={hasConfiguredAccounts}
          {...props}
        />
      ) : (
        <InstantOnboardingScreen
          selectedAccountId={selectedAccountId}
          onCancel={() => resetInstantOnboarding()}
        />
      )}
    </ImageBackdrop>
  )
}
