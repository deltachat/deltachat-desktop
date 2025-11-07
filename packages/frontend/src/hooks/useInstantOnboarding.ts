import { useCallback, useContext } from 'react'

import useDialog from './dialog/useDialog'
import useSecureJoin from './useSecureJoin'
import { ConfigureProgressDialog } from '../components/dialogs/ConfigureProgressDialog'
import { DEFAULT_CHATMAIL_HOSTNAME } from '../components/screens/WelcomeScreen/chatmailInstances'
import { InstantOnboardingContext } from '../contexts/InstantOnboardingContext'

import type { T } from '@deltachat/jsonrpc-client'
import type { WelcomeQrWithUrl } from '../contexts/InstantOnboardingContext'
import type {
  AccountQr,
  LoginQr,
  JoinBroadcastQr,
  VerifyContactQr,
  VerifyGroupQr,
} from '../backend/qr'
import AlertDialog from '../components/dialogs/AlertDialog'

type InstantOnboarding = {
  createInstantAccount: (accountId: number) => Promise<T.FullChat['id'] | null>
  /** Exit the instant onboarding flow */
  resetInstantOnboarding: () => void
  /** Whether instant onboarding is active */
  showInstantOnboarding: boolean
  /** Remember the qr code in the InstantOnboardingContext and set `showInstantOnboarding` to true
   * The welcome screen will then pick up `showInstantOnboarding` and directly open the instant onboarding view
   */
  startInstantOnboardingFlow: (qrWithUrl?: WelcomeQrWithUrl) => Promise<void>
  welcomeQr?: WelcomeQrWithUrl
}

/*
 * Instant Onboarding allows users to create a new email address on the fly
 * to immediately have a working transport for their new profile
 */
export default function useInstantOnboarding(): InstantOnboarding {
  const context = useContext(InstantOnboardingContext)
  const { openDialog } = useDialog()
  const { secureJoin } = useSecureJoin()

  if (!context) {
    throw new Error(
      'useInstantOnboarding has to be used within <InstantOnboardingProvider>'
    )
  }

  const {
    setShowInstantOnboarding,
    setWelcomeQr,
    showInstantOnboarding,
    welcomeQr,
  } = context

  const startInstantOnboardingFlow = useCallback(
    async (qrWithUrl?: WelcomeQrWithUrl) => {
      setShowInstantOnboarding(true)

      // Since a QR code can be scanned by the user in literally any situation,
      // also when the user already has an existing account and is logged in, we
      // can store it here temporarily, adjust the UI state and bring the user
      // back to the QR code process again when everything is ready.
      setWelcomeQr(qrWithUrl)
    },
    [setWelcomeQr, setShowInstantOnboarding]
  )

  /**
   * In "Instant Onboarding" login flow the user is not
   * asked to manually insert any mail server credentials.
   *
   * @throws {Error} if the QR code is invalid or the configuration process fails
   */
  const createInstantAccount = useCallback(
    async (accountId: number): Promise<T.FullChat['id'] | null> => {
      // DCACCOUNT is the default QR code which is used if the user
      // didn't scan a code but just clicked the button to create a
      // new account on the welcome screen.
      let configurationQR = `dcaccount:${DEFAULT_CHATMAIL_HOSTNAME}`

      if (welcomeQr) {
        if (welcomeQr.qr.kind === 'account') {
          // override the default chatmail instance set above
          // Internally, the function will call the chatmail instance URL via HTTP
          // from which it'll receive the address and password as an JSON object.
          //
          // After parsing it'll automatically configure the account with the
          // appropriate keys for login, e.g. `addr` and `password`
          configurationQR = welcomeQr.url
        } else if (welcomeQr.qr.kind === 'login') {
          // The credentails come from the scanned DCLOGIN qr code
          // the account has to already exist on the mail server
          // the host and credentials are extracted from URL
          configurationQR = welcomeQr.url
        } else {
          // Exhaustivity check, these QR codes just use default configurationQR
          const _: VerifyContactQr | VerifyGroupQr | JoinBroadcastQr | never =
            welcomeQr.qr
        }
      }

      return new Promise((resolve, reject) => {
        // show the configure progress dialog where
        // the actual account creation happens
        openDialog(ConfigureProgressDialog, {
          credentials: null,
          qrCode: configurationQR,
          onSuccess: async () => {
            // configure was successful so if there was an invite
            // we proceed with secureJoin and return the related chatId
            // otherwise we just return null since there was a lastChatId
            // set in the configure progress dialog pointing to deviceChat
            // for new accounts
            try {
              // If the QR code included a contact or group to join, we continue with this now
              let chatId: number | null = null
              if (welcomeQr) {
                if (
                  welcomeQr.qr.kind === 'askVerifyContact' ||
                  welcomeQr.qr.kind === 'askVerifyGroup' ||
                  welcomeQr.qr.kind === 'askJoinBroadcast'
                ) {
                  chatId = await secureJoin(
                    accountId,
                    { ...welcomeQr, qr: welcomeQr.qr },
                    true
                  )
                } else {
                  // Exhaustivity check
                  const _: AccountQr | LoginQr | never = welcomeQr.qr
                }
              }

              // Return optional id of chat here so the UI can switch to it
              resolve(chatId)
            } catch (error: any) {
              reject(error)
            }
          },
          onFail: error => {
            openDialog(AlertDialog, { message: error })
          },
        })
      })
    },
    [openDialog, secureJoin, welcomeQr]
  )

  const resetInstantOnboarding = () => {
    setWelcomeQr(undefined)
    setShowInstantOnboarding(false)
  }

  return {
    createInstantAccount,
    resetInstantOnboarding,
    showInstantOnboarding,
    startInstantOnboardingFlow,
    welcomeQr,
  }
}
