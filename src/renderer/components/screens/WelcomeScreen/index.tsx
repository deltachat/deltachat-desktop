import React from 'react'

import Dialog from '../../Dialog'
import ImageBackdrop from '../../ImageBackdrop'
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
    resetInstantOnboarding,
    showInstantOnboarding,
    switchToInstantOnboarding,
  } = useInstantOnboarding()

  const onClose = () => {
    // Prevent user from closing dialog
  }

  return (
    <ImageBackdrop variant='welcome'>
      <Dialog fixed onClose={onClose} width={400}>
        {showInstantOnboarding ? (
          <InstantAccountScreen
            selectedAccountId={selectedAccountId}
            onCancel={() => resetInstantOnboarding()}
          />
        ) : (
          <OnboardingScreen
            selectedAccountId={selectedAccountId}
            onNextStep={() => switchToInstantOnboarding(selectedAccountId)}
            {...props}
          />
        )}
      </Dialog>
    </ImageBackdrop>
  )
}
