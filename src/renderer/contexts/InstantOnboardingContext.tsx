import React, { useState } from 'react'

import type { PropsWithChildren } from 'react'
import type { QrWithUrl } from '../backend/qr'

type InstantOnboardingContextValue = {
  setShowInstantOnboarding: (value: boolean) => void
  setWelcomeQr: (value?: QrWithUrl) => void
  showInstantOnboarding: boolean
  welcomeQr?: QrWithUrl
}

export const InstantOnboardingContext =
  React.createContext<InstantOnboardingContextValue | null>(null)

export const InstantOnboardingProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  // Flag to display "Instant Onboarding" UI in welcome screen
  const [showInstantOnboarding, setShowInstantOnboarding] = useState(false)

  // Some QR codes invite the user to create a new account on a chatmail
  // instance.
  //
  // Since this QR code can be scanned by the user in literally any situation,
  // also when the user already has an existing account and is logged in, we
  // can store it here temporarily, adjust the UI state and bring the user
  // back to the QR code process again when everything is ready.
  const [welcomeQr, setWelcomeQr] = useState<QrWithUrl | undefined>(undefined)

  const value = {
    setShowInstantOnboarding,
    setWelcomeQr,
    showInstantOnboarding,
    welcomeQr,
  }

  return (
    <InstantOnboardingContext.Provider value={value}>
      {children}
    </InstantOnboardingContext.Provider>
  )
}
