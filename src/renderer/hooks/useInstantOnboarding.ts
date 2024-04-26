import { useCallback, useContext } from 'react'

import useDialog from '../hooks/dialog/useDialog'
import useSecureJoin from './useSecureJoin'
import { BackendRemote } from '../backend-com'
import { ConfigureProgressDialog } from '../components/LoginForm'
import { InstantOnboardingContext } from '../contexts/InstantOnboardingContext'

import type { T } from '@deltachat/jsonrpc-client'
import type { QrWithUrl } from '../backend/qr'

const DEFAULT_CHATMAIL_INSTANCE_URL =
  'https://nine.testrun.org/cgi-bin/newemail.py'

/*
 * Instant Onboarding allows users to create new email addresses from within the
 * application, giving them a faster way to get a working profile.
 */
export default function useInstantOnboarding() {
  const context = useContext(InstantOnboardingContext)
  const { openDialog } = useDialog()
  const { secureJoinContact, secureJoinGroup } = useSecureJoin()

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
        if (
          !['account', 'askVerifyGroup', 'askVerifyContact'].includes(
            qrWithUrl.qr.kind
          )
        ) {
          throw new Error(
            'QR code needs to be of kind `account`, `askVerifyGroup` or `askVerifyContact` for instant onboarding flow'
          )
        }
      }

      setShowInstantOnboarding(true)

      // Since a QR code can be scanned by the user in literally any situation,
      // also when the user already has an existing account and is logged in, we
      // can store it here temporarily, adjust the UI state and bring the user
      // back to the QR code process again when everything is ready.
      setWelcomeQr(qrWithUrl)
    },
    [setWelcomeQr, setShowInstantOnboarding]
  )

  const createInstantAccount = useCallback(
    async (
      accountId: number,
      displayName: string,
      profilePicture?: string
    ): Promise<T.FullChat['id'] | null> => {
      let instanceUrl = `dcaccount:${DEFAULT_CHATMAIL_INSTANCE_URL}`

      // Use custom chatmail instance if given by QR code
      if (welcomeQr && welcomeQr.qr.kind === 'account') {
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
        // 2. Kick-off the actual account creation process by calling
        // `configure`. This happens inside of this dialog
        openDialog(ConfigureProgressDialog, {
          onSuccess: async () => {
            try {
              // 3. Additionally we set the `selfavatar` / profile picture
              // and `displayname` configuration for this account.
              //
              // Note: We need to set these profile settings _after_
              // calling `configure` to make the UI aware of them already
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

              // 4. If the user created a new account from trying to contact
              // another user or joining the group we continue with this now
              let chatId: number | null = null
              if (welcomeQr) {
                if (welcomeQr.qr.kind === 'askVerifyContact') {
                  chatId = await secureJoinContact(accountId, welcomeQr, true)
                } else if (welcomeQr.qr.kind === 'askVerifyGroup') {
                  chatId = await secureJoinGroup(accountId, welcomeQr, true)
                }
              }

              // Return optional id of chat here so the UI can switch to it
              resolve(chatId)
            } catch (error: any) {
              reject(error)
            }
          },
        })
      })
    },
    [openDialog, secureJoinContact, secureJoinGroup, welcomeQr]
  )

  const resetInstantOnboarding = () => {
    setWelcomeQr(undefined)
    setShowInstantOnboarding(false)
  }

  return {
    createInstantAccount,
    resetInstantOnboarding,
    showInstantOnboarding,
    switchToInstantOnboarding,
    welcomeQr,
  }
}
