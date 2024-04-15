import React, { useEffect, useState } from 'react'

import Dialog from '../../Dialog'
import InstantAccountScreen from './InstantAccountScreen'
import OnboardingScreen from './OnboardingScreen'
import useProcessQr from '../../../hooks/useProcessQr'

// import styles from './styles.module.scss'

type Props = {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}

export default function WelcomeScreen({ selectedAccountId, ...props }: Props) {
  const processQr = useProcessQr()
  const [showNextStep, setShowNextStep] = useState(false)

  const onClose = () => {
    // Prevent user from closing dialog
  }

  const onNextStep = () => {
    setShowNextStep(true)
  }

  const onCancelCreateAccount = () => {
    setShowNextStep(false)
  }

  useEffect(() => {
    // "callback" when opening dclogin or dcaccount from an already existing
    // account, the app needs to switch to the welcome screen first.
    const checkQRCode = async () => {
      if (!window.__welcome_qr) {
        return
      }
      await processQr(selectedAccountId, window.__welcome_qr, undefined, true)
      window.__welcome_qr = undefined
    }

    checkQRCode()
  }, [selectedAccountId, processQr])

  return (
    <Dialog fixed onClose={onClose} width={400}>
      {showNextStep ? (
        <InstantAccountScreen
          selectedAccountId={selectedAccountId}
          onCancel={onCancelCreateAccount}
        />
      ) : (
        <OnboardingScreen
          selectedAccountId={selectedAccountId}
          onNextStep={onNextStep}
          {...props}
        />
      )}
    </Dialog>
  )
}
