import React, { useLayoutEffect, useState } from 'react'

import Dialog from '../../Dialog'
import ImageBackdrop from '../../ImageBackdrop'
import InstantAccountScreen from './InstantAccountScreen'
import OnboardingScreen from './OnboardingScreen'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import { BackendRemote } from '../../../backend-com'

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
  const [showBackButton, setShowBackButton] = useState(true)

  const onClose = () => {
    // Prevent user from closing dialog
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

  return (
    <ImageBackdrop variant='welcome'>
      <Dialog fixed onClose={onClose} width={400}>
        {!showInstantOnboarding ? (
          <OnboardingScreen
            onNextStep={() => switchToInstantOnboarding()}
            selectedAccountId={selectedAccountId}
            showBackButton={showBackButton}
            {...props}
          />
        ) : (
          <InstantAccountScreen
            selectedAccountId={selectedAccountId}
            onCancel={() => resetInstantOnboarding()}
          />
        )}
      </Dialog>
    </ImageBackdrop>
  )
}
