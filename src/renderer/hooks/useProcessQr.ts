import { useCallback, useContext } from 'react'

import CopyContentAlertDialog from '../components/CopyContentAlertDialog'
import QrErrorMessage from '../components/QrErrorMessage'
import useAlertDialog from './dialog/useAlertDialog'
import useConfirmationDialog from './dialog/useConfirmationDialog'
import useDialog from './dialog/useDialog'
import useInstantOnboarding from './useInstantOnboarding'
import useOpenMailtoLink from './useOpenMailtoLink'
import useSecureJoin from './useSecureJoin'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { ConfigureProgressDialog } from '../components/LoginForm'
import { ReceiveBackupDialog } from '../components/dialogs/SetupMultiDevice'
import { ScreenContext } from '../contexts/ScreenContext'
import { Screens } from '../ScreenController'
import { getConfiguredAccounts, isAccountConfigured } from '../backend/account'
import { getLogger } from '../../shared/logger'
import { processQr } from '../backend/qr'

import type { T } from '@deltachat/jsonrpc-client'
import type { QrWithUrl } from '../backend/qr'

const ALLOWED_QR_CODES_ON_WELCOME_SCREEN: T.Qr['kind'][] = [
  'account',
  'askVerifyContact',
  'askVerifyGroup',
  'backup',
  'login',
  'text',
  'url',
]

const log = getLogger('renderer/hooks/useProcessQr')

/**
 * Processes an unchecked string which was scanned from a QR code.
 *
 * If the string represents a valid DeltaChat URI-scheme, it initiatives
 * various secure join, instant onboarding or other actions based on it.
 *
 * See list of supported DeltaChat URI-schemes here:
 * - https://github.com/deltachat/interface/blob/master/uri-schemes.md
 * - https://c.delta.chat/classdc__context__t.html#a34a865a52127ed2cc8c2f016f085086c
 */
export default function useProcessQR() {
  const tx = useTranslationFunction()
  const { screen, changeScreen } = useContext(ScreenContext)
  const { openDialog } = useDialog()
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()

  const openMailtoLink = useOpenMailtoLink()
  const { switchToInstantOnboarding } = useInstantOnboarding()
  const { secureJoinGroup, secureJoinContact } = useSecureJoin()

  const setConfigFromQrCatchingErrorInAlert = useCallback(
    async (accountId: number, qrContent: string) => {
      try {
        await BackendRemote.rpc.setConfigFromQr(accountId, qrContent)
      } catch (error) {
        if (error instanceof Error) {
          openAlertDialog({
            message: error.message,
          })
        }
      }
    },
    [openAlertDialog]
  )

  // Log user out if they already have an configured account
  const makeSureToLogOut = useCallback(async (accountId: number) => {
    const isLoggedIn = await isAccountConfigured(accountId)
    if (isLoggedIn) {
      // Log out first by switching to an (temporary) blank account
      const blankAccount = await BackendRemote.rpc.addAccount()

      // Select blank account, this will also switch the screen to `Welcome`
      await window.__selectAccount(blankAccount)
    }
  }, [])

  // Users can enter the "Instant Onboarding" flow by scanning a DCACCOUNT,
  // DC_ASK_VERIFYGROUP, or DC_ASK_VERIFYCONTACT code which essentially creates
  // a new "chatmail" profile for them and connects them with the regarding
  // contact or group if given.
  //
  // We ask the user if they really want to proceed with this action and
  // accordingly prepare the onboarding.
  const startInstantOnboarding = useCallback(
    async (accountId: number, qrWithUrl: QrWithUrl) => {
      const { qr } = qrWithUrl
      const numberOfAccounts = (await getConfiguredAccounts()).length

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
          message: tx('instant_onboarding_confirm_group', qr.grpname),
          confirmLabel: tx('ok'),
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
          message: tx('instant_onboarding_confirm_contact', contact.address),
          confirmLabel: tx('ok'),
        })

        if (!userConfirmed) {
          return
        }
      }

      // Start instant onboarding flow for user
      await switchToInstantOnboarding(qrWithUrl)
      await makeSureToLogOut(accountId)
    },
    [makeSureToLogOut, openConfirmationDialog, switchToInstantOnboarding, tx]
  )

  // Users can login with any given credentials from a scanned `DCLOGIN` QR
  // code.
  //
  // We ask the user if they really want to proceed with this action and log
  // them in automatically.
  const startLogin = useCallback(
    async (accountId: number, qrWithUrl: QrWithUrl) => {
      const { qr, url } = qrWithUrl
      if (qr.kind !== 'login') {
        throw new Error('QR code needs to be of kind "login"')
      }

      const hasConfiguredAccount = (await getConfiguredAccounts()).length > 0
      const message = hasConfiguredAccount
        ? 'qrlogin_ask_login_another'
        : 'qrlogin_ask_login'
      const userConfirmed = await openConfirmationDialog({
        message: tx(message, qr.address),
        confirmLabel: tx('login_title'),
      })

      if (!userConfirmed) {
        return
      }

      try {
        await makeSureToLogOut(accountId)

        await BackendRemote.rpc.setConfigFromQr(accountId, url)
        openDialog(ConfigureProgressDialog, {
          onSuccess: () => {
            changeScreen(Screens.Main)
          },
        })
      } catch (err: any) {
        openAlertDialog({
          message: err.message || err.toString(),
        })
      }
    },
    [
      changeScreen,
      makeSureToLogOut,
      openAlertDialog,
      openConfirmationDialog,
      openDialog,
      tx,
    ]
  )

  return useCallback(
    async (
      accountId: number,
      url: string,
      callback?: (chatId?: number) => void
    ) => {
      // Scanned string is actually a link to an email address
      if (url.toLowerCase().startsWith('mailto:')) {
        await openMailtoLink(accountId, url, callback)
        return
      }

      // Check if given string is a valid DeltaChat URI-Scheme and return
      // parsed object, otherwise show an error to the user
      let parsed: QrWithUrl
      try {
        parsed = await processQr(accountId, url)
      } catch (err) {
        log.error(err)

        await openAlertDialog({
          message: QrErrorMessage({ url }),
        })

        callback && callback()
        return
      }

      const { qr } = parsed

      // Some actions can only be executed when the user already has an account
      // and is logged in
      const isLoggedIn = await isAccountConfigured(accountId)
      if (
        !ALLOWED_QR_CODES_ON_WELCOME_SCREEN.includes(qr.kind) &&
        !isLoggedIn
      ) {
        await openAlertDialog({
          message: tx('Please login first'),
        })
        callback && callback()
        return
      }

      // DCACCOUNT: Ask the user if they want to create a new profile on the
      // given chatmail instance
      if (qr.kind === 'account') {
        await startInstantOnboarding(accountId, parsed)
        callback && callback()
        return
      }

      // DCLOGIN: Ask the user if they want to login with given credentials
      if (qr.kind === 'login') {
        await startLogin(accountId, parsed)
        callback && callback()
        return
      }

      // DC_ASK_VERIFYCONTACT: Ask whether to verify the contact; if so, start
      // the protocol with secure join
      if (qr.kind === 'askVerifyContact') {
        if (screen === Screens.Welcome) {
          // Ask user to create a new account with instant onboarding flow before they
          // can start chatting with the given contact
          await startInstantOnboarding(accountId, parsed)
          callback && callback()
        } else {
          const chatId = await secureJoinContact(accountId, parsed)
          if (chatId) {
            callback && callback(chatId)
          }
        }
        return
      }

      // DC_ASK_VERIFYGROUP: Ask whether to join the group; if so, start the
      // protocol with secure join
      if (qr.kind === 'askVerifyGroup') {
        if (screen === Screens.Welcome) {
          // Ask user to create a new account with instant onboarding flow before they
          // can join the given group
          await startInstantOnboarding(accountId, parsed)
          callback && callback()
        } else {
          const chatId = await secureJoinGroup(accountId, parsed)
          if (chatId) {
            callback && callback(chatId)
          }
        }
        return
      }

      // DCBACKUP: Ask the user if they want to set up a new device
      if (qr.kind === 'backup') {
        if (screen === Screens.Main) {
          await openAlertDialog({
            message: tx('Please logout first'),
          })
          callback && callback()
        } else {
          openDialog(ReceiveBackupDialog, {
            QrWithToken: url,
          })
        }
        callback && callback()
        return
      }

      // DC_FPR_OK: Verify contact fingerprint
      if (qr.kind === 'fprOk') {
        const contact = await BackendRemote.rpc.getContact(
          accountId,
          qr.contact_id
        )

        const userConfirmed = await openConfirmationDialog({
          message: `The fingerprint of ${contact.displayName} is valid!`,
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          callback && callback()
        }
        return
      }

      // DC_WITHDRAW_VERIFYCONTACT: Ask user to withdraw verified contact
      if (qr.kind === 'withdrawVerifyContact') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifycontact_explain'),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
        return
      }

      // DC_REVIVE_VERIFYCONTACT: Ask user to revive withdrawn contact
      // verification
      if (qr.kind === 'reviveVerifyContact') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('revive_verifycontact_explain'),
          header: tx('revive_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
        return
      }

      // DC_WITHDRAW_VERIFYGROUP: Ask user to withdraw verified group
      if (qr.kind === 'withdrawVerifyGroup') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifygroup_explain', qr.grpname),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
        return
      }

      // DC_REVIVE_VERIFYGROUP: Ask user to revive from withdrawn verified
      // group
      if (qr.kind === 'reviveVerifyGroup') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('revive_verifygroup_explain', qr.grpname),
          header: tx('revive_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
        return
      }

      // Just show the contents of the scanned QR code if it is correct but
      // we don't know what to do with it ..
      openDialog(CopyContentAlertDialog, {
        message:
          qr.kind === 'url'
            ? tx('qrscan_contains_url', url)
            : tx('qrscan_contains_text', url),
        content: url,
        cb: callback,
      })
    },
    [
      openAlertDialog,
      openConfirmationDialog,
      openDialog,
      openMailtoLink,
      screen,
      secureJoinContact,
      secureJoinGroup,
      setConfigFromQrCatchingErrorInAlert,
      startInstantOnboarding,
      startLogin,
      tx,
    ]
  )
}
