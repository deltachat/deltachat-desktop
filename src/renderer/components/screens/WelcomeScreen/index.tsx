import React from 'react'

import Dialog from '../../Dialog'
import InstantAccountScreen from './InstantAccountScreen'
import OnboardingScreen from './OnboardingScreen'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}

export default function WelcomeScreen({ selectedAccountId, ...props }: Props) {
  const {
    cancelInstantOnboarding,
    showInstantOnboarding,
    switchToInstantOnboarding,
  } = useInstantOnboarding()

  const onClose = () => {
    // Prevent user from closing dialog
  }

  return (
    <Dialog fixed onClose={onClose} width={400}>
      {showInstantOnboarding ? (
        <InstantAccountScreen
          selectedAccountId={selectedAccountId}
          onCancel={() => cancelInstantOnboarding()}
        />
      ) : (
        <OnboardingScreen
          selectedAccountId={selectedAccountId}
          onNextStep={() => switchToInstantOnboarding()}
          {...props}
        />
      )}
    </Dialog>
  )
}
