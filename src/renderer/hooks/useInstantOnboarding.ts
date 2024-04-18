import { useCallback, useContext } from 'react'

import useConfirmationDialog from './dialog/useConfirmationDialog'
import useDialog from '../hooks/dialog/useDialog'
import useSecureJoin from './useSecureJoin'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { ConfigureProgressDialog } from '../components/LoginForm'
import { InstantOnboardingContext } from '../contexts/InstantOnboardingContext'
import { ScreenContext } from '../contexts/ScreenContext'
import { Screens } from '../ScreenController'

import type { QrWithUrl } from './useProcessQr'
import type { T } from '@deltachat/jsonrpc-client'

const DEFAULT_CHATMAIL_INSTANCE_URL =
  'https://nine.testrun.org/cgi-bin/newemail.py'

export default function useInstantOnboarding() {
  const context = useContext(InstantOnboardingContext)
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { screen } = useContext(ScreenContext)
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
    async (accountId: number, qrWithUrl?: QrWithUrl) => {
      if (qrWithUrl) {
        const { qr } = qrWithUrl
        if (
          !['account', 'askVerifyGroup', 'askVerifyContact'].includes(qr.kind)
        ) {
          throw new Error(
            'QR code needs to be of kind `account`, `askVerifyGroup` or `askVerifyContact` for instant onboarding flow'
          )
        }

        const numberOfAccounts = (await BackendRemote.rpc.getAllAccountIds())
          .length

        if (qr.kind === 'account' && numberOfAccounts > 0) {
          // Ask user to confirm creating a new account if they already have one
          const message: string =
            numberOfAccounts === 1
              ? 'qraccount_ask_create_and_login'
              : 'qraccount_ask_create_and_login_another'
          const userConfirmed = await openConfirmationDialog({
            message: tx(message, qr.domain),
            confirmLabel: tx('login_title'),
          })

          if (!userConfirmed) {
            return
          }
        } else if (qr.kind === 'askVerifyGroup') {
          // Ask the user if they want to create a new account and join the group
          const userConfirmed = await openConfirmationDialog({
            message: tx('instantonboarding_with_join_group', qr.grpname),
            confirmLabel: tx('instantonboarding_lets_get_started'),
          })

          if (!userConfirmed) {
            return
          }
        } else if (qr.kind === 'askVerifyContact') {
          // Ask the user if they want to create a new account and start
          // chatting with contact
          const contact = await BackendRemote.rpc.getContact(
            accountId,
            qr.contact_id
          )

          const userConfirmed = await openConfirmationDialog({
            message: tx('instantonboarding_with_join_contact', contact.address),
            confirmLabel: tx('instantonboarding_lets_get_started'),
          })

          if (!userConfirmed) {
            return
          }
        }
      }

      setWelcomeQr(qrWithUrl)
      setShowInstantOnboarding(true)

      setTimeout(async () => {
        if (screen !== Screens.Welcome) {
          // Log out first by switching to an (temporary) blank account
          const blankAccount = await BackendRemote.rpc.addAccount()

          // Select blank account, this will also switch the screen to `Welcome`
          window.__selectAccount(blankAccount)
        }
      })
    },
    [openConfirmationDialog, screen, setShowInstantOnboarding, setWelcomeQr, tx]
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
        try {
          // 2. Kick-off the actual account creation process by calling
          // `configure`. This happens inside of this dialog
          openDialog(ConfigureProgressDialog, {
            onSuccess: async () => {
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

              // 4. If the user created a new account from trying to contact another user
              // or joining the group we continue with this now
              let chatId: number | null = null
              if (welcomeQr) {
                if (welcomeQr.qr.kind === 'askVerifyContact') {
                  chatId = await secureJoinContact(accountId, welcomeQr, true)
                } else if (welcomeQr.qr.kind === 'askVerifyGroup') {
                  chatId = await secureJoinGroup(accountId, welcomeQr, true)
                }
              }

              resolve(chatId)
            },
          })
        } catch (error: any) {
          reject(error)
        }
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
