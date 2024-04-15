import { useCallback, useContext } from 'react'

import useConfirmationDialog from './useConfirmationDialog'
import useDialog from '../hooks/useDialog'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { ConfigureProgressDialog } from '../components/LoginForm'
import { InstantOnboardingContext } from '../contexts/InstantOnboardingContext'
import { ScreenContext } from '../contexts/ScreenContext'
import { Screens } from '../ScreenController'

import type { QrWithUrl } from './useProcessQr'

const DEFAULT_CHATMAIL_INSTANCE_URL =
  'https://nine.testrun.org/cgi-bin/newemail.py'

export default function useInstantOnboarding() {
  const context = useContext(InstantOnboardingContext)
  const { openDialog } = useDialog()
  const { screen, changeScreen } = useContext(ScreenContext)
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

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

  const switchToInstantOnboarding = useCallback(
    async (qrWithUrl?: QrWithUrl) => {
      if (qrWithUrl) {
        const { qr } = qrWithUrl
        if (qr.kind !== 'account') {
          throw new Error(
            'QR code needs to be of kind `account` for instant onboarding flow'
          )
        }

        // Ask user to confirm creating a new account
        const hasOnlyOneAccount =
          (await BackendRemote.rpc.getAllAccountIds()).length == 1
        const message: string = hasOnlyOneAccount
          ? 'qraccount_ask_create_and_login'
          : 'qraccount_ask_create_and_login_another'
        const replacementValue = qr.domain
        const userConfirmed = await openConfirmationDialog({
          message: tx(message, replacementValue),
          confirmLabel: tx('login_title'),
        })

        if (!userConfirmed) {
          return
        }
      }

      setWelcomeQr(qrWithUrl)
      setShowInstantOnboarding(true)

      setTimeout(async () => {
        if (screen !== Screens.Welcome) {
          // Log out first by switching to an (temporary) blank account
          const blankAccount = await BackendRemote.rpc.addAccount()
          window.__selectAccount(blankAccount)
          changeScreen(Screens.Welcome)
        }
      })
    },
    [
      changeScreen,
      openConfirmationDialog,
      screen,
      setShowInstantOnboarding,
      setWelcomeQr,
      tx,
    ]
  )

  const createInstantAccount = useCallback(
    async (
      accountId: number,
      displayName: string,
      profilePicture?: string
    ): Promise<void> => {
      let instanceUrl = `dcaccount:${DEFAULT_CHATMAIL_INSTANCE_URL}`
      if (welcomeQr) {
        instanceUrl = welcomeQr.url
      }

      // 1. In this "Instant Onboarding" account creation flow the user is not
      // asked to manually insert any mail server credentials.
      //
      // Internally, the function will call the chatmail instance URL via HTTP
      // from which it'll receive the address and password as an JSON object.
      //
      // After parsing it'll automatically configure the account with the
      // appropriate keys for login, e.g. `addr` and `mail_pw`
      await BackendRemote.rpc.setConfigFromQr(accountId, instanceUrl)

      return new Promise((resolve, reject) => {
        try {
          // 2. Kick-off the actual account creation process by calling
          // `configure`. This happens inside of this dialog
          openDialog(ConfigureProgressDialog, {
            onSuccess: async () => {
              // Clean up after ourselves
              setWelcomeQr(undefined)

              // 3. Additionally we set the `selfavatar` / profile picture
              // and `displayname` configuration for this account
              //
              // Note: We need to set these profile settings _after_
              // calling `configure` to make the UI aware of them already.
              //
              // @TODO: Not sure why it doesn't work otherwise, the
              // configuration seems to be set correctly in both cases?
              if (profilePicture) {
                await BackendRemote.rpc.setConfig(
                  accountId,
                  'selfavatar',
                  profilePicture
                )
              }
              await BackendRemote.rpc.setConfig(
                accountId,
                'displayname',
                displayName
              )

              // 4. We redirect the user to the main screen after the
              // account got successfully created.
              //
              // Note: This happens within a timeout to make sure we can
              // finish the process first before unmounting the component
              // which started it
              setTimeout(() => {
                setShowInstantOnboarding(false)
                changeScreen(Screens.Main)
              })

              resolve()
            },
          })
        } catch (error: any) {
          reject(error)
        }
      })
    },
    [
      changeScreen,
      openDialog,
      setShowInstantOnboarding,
      setWelcomeQr,
      welcomeQr,
    ]
  )

  const cancelInstantOnboarding = () => {
    setWelcomeQr(undefined)
    setShowInstantOnboarding(false)
  }

  return {
    createInstantAccount,
    showInstantOnboarding,
    switchToInstantOnboarding,
    cancelInstantOnboarding,
    welcomeQr,
  }
}
