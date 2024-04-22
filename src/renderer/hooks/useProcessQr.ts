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
import { ReceiveBackupDialog } from '../components/dialogs/SetupMultiDevice'
import { ScreenContext } from '../contexts/ScreenContext'
import { Screens } from '../ScreenController'
import { getLogger } from '../../shared/logger'

import type { T } from '@deltachat/jsonrpc-client'

export type QrWithUrl = {
  qr: T.Qr
  url: string
}

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

async function processQr(accountId: number, url: string): Promise<QrWithUrl> {
  const qr = await BackendRemote.rpc.checkQr(accountId, url)

  if (!qr) {
    throw new Error()
  }

  return {
    qr,
    url,
  }
}

export default function useProcessQR() {
  const tx = useTranslationFunction()
  const { screen } = useContext(ScreenContext)
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

  return useCallback(
    async (
      accountId: number,
      url: string,
      callback?: (chatId?: number) => void
    ) => {
      if (url.toLowerCase().startsWith('mailto:')) {
        await openMailtoLink(accountId, url, callback)
        return
      }

      let parsed: QrWithUrl | null = null
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

      if (
        !ALLOWED_QR_CODES_ON_WELCOME_SCREEN.includes(qr.kind) &&
        screen !== Screens.Main
      ) {
        await openAlertDialog({
          message: tx('Please login first'),
        })
        callback && callback()
        return
      }

      // Ask the user if they want to login with given credentials
      if (qr.kind === 'login') {
        await switchToInstantOnboarding(accountId, parsed)
        callback && callback()
        return
      }

      // Ask the user if they want to create a profile on the given chatmail instance
      if (qr.kind === 'account') {
        await switchToInstantOnboarding(accountId, parsed)
        callback && callback()
        return
      }

      // Ask whether to verify the contact; if so, start the protocol with secure join
      if (qr.kind === 'askVerifyContact') {
        if (screen === Screens.Welcome) {
          // Ask user to create a new account with instant onboarding flow before they
          // can start chatting with the given contact
          await switchToInstantOnboarding(accountId, parsed)
          callback && callback()
        } else {
          const chatId = await secureJoinContact(accountId, parsed)
          if (chatId) {
            callback && callback(chatId)
          }
        }
        return
      }

      // Ask whether to join the group; if so, start the protocol with secure join
      if (qr.kind === 'askVerifyGroup') {
        if (screen === Screens.Welcome) {
          // Ask user to create a new account with instant onboarding flow before they
          // can join the given group
          await switchToInstantOnboarding(accountId, parsed)
          callback && callback()
        } else {
          const chatId = await secureJoinGroup(accountId, parsed)
          if (chatId) {
            callback && callback(chatId)
          }
        }
        return
      }

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
      } else if (qr.kind === 'withdrawVerifyContact') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifycontact_explain'),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
      } else if (qr.kind === 'reviveVerifyContact') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('revive_verifycontact_explain'),
          header: tx('revive_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
      } else if (qr.kind === 'withdrawVerifyGroup') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifygroup_explain', qr.grpname),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
      } else if (qr.kind === 'reviveVerifyGroup') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('revive_verifygroup_explain', qr.grpname),
          header: tx('revive_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(accountId, url)
        }

        callback && callback()
      } else if (qr.kind === 'backup') {
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
      } else {
        openDialog(CopyContentAlertDialog, {
          message:
            qr.kind === 'url'
              ? tx('qrscan_contains_url', url)
              : tx('qrscan_contains_text', url),
          content: url,
          cb: callback,
        })
      }
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
      switchToInstantOnboarding,
      tx,
    ]
  )
}
