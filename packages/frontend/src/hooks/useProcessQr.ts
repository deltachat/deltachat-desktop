import { useCallback, useContext } from 'react'

import CopyContentAlertDialog from '../components/CopyContentAlertDialog'
import useAlertDialog from './dialog/useAlertDialog'
import useConfirmationDialog from './dialog/useConfirmationDialog'
import useDialog from './dialog/useDialog'
import useInstantOnboarding from './useInstantOnboarding'
import useOpenMailtoLink from './useOpenMailtoLink'
import useSecureJoin from './useSecureJoin'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { ReceiveBackupProgressDialog } from '../components/dialogs/SetupMultiDevice'
import { ScreenContext } from '../contexts/ScreenContext'
import { getLogger } from '../../../shared/logger'
import { processQr } from '../backend/qr'

import type { T } from '@deltachat/jsonrpc-client'
import type { QrWithUrl } from '../backend/qr'
import type { WelcomeQrWithUrl } from '../contexts/InstantOnboardingContext'
import useChat from './chat/useChat'

const ALLOWED_QR_CODES_ON_WELCOME_SCREEN: T.Qr['kind'][] = [
  'account',
  'askVerifyContact',
  'askVerifyGroup',
  'backup2',
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
 * - https://github.com/deltachat/interface/blob/main/uri-schemes.md
 * - https://c.delta.chat/classdc__context__t.html#a34a865a52127ed2cc8c2f016f085086c
 */
export default function useProcessQR() {
  const tx = useTranslationFunction()
  const { addAndSelectAccount } = useContext(ScreenContext)
  const { openDialog } = useDialog()
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()

  const openMailtoLink = useOpenMailtoLink()
  const { startInstantOnboardingFlow } = useInstantOnboarding()
  const { secureJoinGroup, secureJoinContact } = useSecureJoin()

  const { selectChat } = useChat()

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

  // Users can enter the "Instant Onboarding" flow by scanning a DCACCOUNT, DCLOGIN
  // DC_ASK_VERIFYGROUP, or DC_ASK_VERIFYCONTACT code which essentially creates
  // a new "chatmail" profile for them and connects them with the regarding
  // contact or group if given.
  //
  // We ask the user if they really want to proceed with this action and
  // accordingly prepare the onboarding.
  const startInstantOnboarding = useCallback(
    async (accountId: number, qrWithUrl: WelcomeQrWithUrl) => {
      const { qr } = qrWithUrl

      if (await BackendRemote.rpc.isConfigured(accountId)) {
        throw new Error(
          'Instant onboarding can not be started on already configured account'
        )
      }

      if (qr.kind === 'askVerifyGroup') {
        // Ask the user if they want to create a new account and join the group
        const userConfirmed = await openConfirmationDialog({
          message: tx('instant_onboarding_confirm_group', qr.grpname),
          confirmLabel: tx('ok'),
          dataTestid: 'ask-join-group',
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
          message: tx(
            'instant_onboarding_confirm_contact',
            contact.nameAndAddr
          ),
          confirmLabel: tx('ok'),
          dataTestid: 'ask-create-profile-and-join-chat',
        })

        if (!userConfirmed) {
          return
        }
      }

      await startInstantOnboardingFlow(qrWithUrl)
    },
    [openConfirmationDialog, startInstantOnboardingFlow, tx]
  )

  return useCallback(
    async (accountId: number, url: string, callback?: () => void) => {
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
          message: tx('qrscan_failed') + '\n\n' + url,
        })

        return callback?.()
      }

      const { qr } = parsed

      if (qr.kind === 'backupTooNew') {
        await openAlertDialog({
          message: tx('multidevice_receiver_needs_update'),
        })
        callback?.()
        return
      }

      // Some actions can only be executed when the user already has an account
      // and is logged in
      const isLoggedIn = await BackendRemote.rpc.isConfigured(accountId)
      if (
        !ALLOWED_QR_CODES_ON_WELCOME_SCREEN.includes(qr.kind) &&
        !isLoggedIn
      ) {
        await openAlertDialog({
          message: tx('Please login first'),
        })
        return callback?.()
      }

      // DCACCOUNT:
      // configured account: Ask the user if they want to create a new profile on the given chatmail instance
      // unconfigured account: set instant onboarding chatmail instance
      if (qr.kind === 'account') {
        if (isLoggedIn) {
          const userConfirmed = await openConfirmationDialog({
            message: tx('qraccount_ask_create_and_login_another', qr.domain),
            confirmLabel: tx('login_title'),
            dataTestid: 'ask-create-account',
          })

          if (!userConfirmed) {
            return callback?.()
          }

          const new_accountId = await addAndSelectAccount()
          await startInstantOnboarding(new_accountId, { ...parsed, qr })
        } else {
          await startInstantOnboarding(accountId, { ...parsed, qr })
        }

        return callback?.()
      }

      // DCLOGIN:
      // configured account: Ask the user if they want to login with given credentials
      // unconfigured account: set instant onboarding credentials
      if (qr.kind === 'login') {
        if (isLoggedIn) {
          const userConfirmed = await openConfirmationDialog({
            message: tx('qrlogin_ask_login_another', qr.address),
            confirmLabel: tx('login_title'),
          })

          if (!userConfirmed) {
            return callback?.()
          }

          const new_accountId = await addAndSelectAccount()
          await startInstantOnboarding(new_accountId, { ...parsed, qr })
        } else {
          await startInstantOnboarding(accountId, { ...parsed, qr })
        }

        return callback?.()
      }

      // DC_ASK_VERIFYCONTACT: Ask whether to verify the contact; if so, start
      // the protocol with secure join
      if (qr.kind === 'askVerifyContact') {
        if (!isLoggedIn) {
          // Ask user to create a new account with instant onboarding flow before they
          // can start chatting with the given contact
          await startInstantOnboarding(accountId, { ...parsed, qr })
        } else {
          const chatId = await secureJoinContact(accountId, { ...parsed, qr })
          if (chatId) {
            selectChat(accountId, chatId)
          }
        }
        return callback?.()
      }

      // DC_ASK_VERIFYGROUP: Ask whether to join the group; if so, start the
      // protocol with secure join
      if (qr.kind === 'askVerifyGroup') {
        if (!isLoggedIn) {
          // Ask user to create a new account with instant onboarding flow before they
          // can join the given group
          await startInstantOnboarding(accountId, { ...parsed, qr })
        } else {
          const chatId = await secureJoinGroup(accountId, { ...parsed, qr })
          if (chatId) {
            selectChat(accountId, chatId)
          }
        }
        return callback?.()
      }

      // DCBACKUP: Ask the user if they want to set up a new device
      if (qr.kind === 'backup2') {
        if (isLoggedIn) {
          await openAlertDialog({
            message: tx('Please logout first'),
          })
          callback?.()
        } else {
          openDialog(ReceiveBackupProgressDialog, {
            QrWithToken: url,
          })
        }
        callback?.()
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
          callback?.()
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

        callback?.()
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

        callback?.()
        return
      }

      // DC_WITHDRAW_VERIFYGROUP: Ask user to withdraw verified group
      if (qr.kind === 'withdrawVerifyGroup') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifygroup_explain', qr.grpname),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
          dataTestid: 'withdraw-verify-group',
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback?.()
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

        callback?.()
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
      secureJoinContact,
      secureJoinGroup,
      setConfigFromQrCatchingErrorInAlert,
      startInstantOnboarding,
      addAndSelectAccount,
      selectChat,
      tx,
    ]
  )
}
