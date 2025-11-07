import React, { useState } from 'react'

import type { PropsWithChildren } from 'react'
import type {
  AccountQr,
  LoginQr,
  QrWithUrl,
  JoinBroadcastQr,
  VerifyContactQr,
  VerifyGroupQr,
} from '../backend/qr'

export type WelcomeQr =
  | VerifyGroupQr
  | VerifyContactQr
  | JoinBroadcastQr
  | AccountQr
  | LoginQr

export type WelcomeQrWithUrl = QrWithUrl<WelcomeQr>

type InstantOnboardingContextValue = {
  setShowInstantOnboarding: (value: boolean) => void
  setWelcomeQr: (value?: WelcomeQrWithUrl) => void
  showInstantOnboarding: boolean
  welcomeQr?: WelcomeQrWithUrl
}

export const InstantOnboardingContext =
  React.createContext<InstantOnboardingContextValue | null>(null)

export const InstantOnboardingProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  // Flag for welcome screen to decide if it shows the "Instant Onboarding" UI or the "Welcome" UI
  const [showInstantOnboarding, setShowInstantOnboarding] = useState(false)

  // Some QR codes invite the user to create a new account on a chatmail
  // instance.
  //
  // Since this QR code can be scanned by the user in literally any situation,
  // also when the user already has an existing account and is logged in, we
  // can store it here temporarily, adjust the UI state and bring the user
  // back to the QR code process again when everything is ready.
  const [welcomeQr, setWelcomeQr] = useState<WelcomeQrWithUrl | undefined>(
    undefined
  )

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
