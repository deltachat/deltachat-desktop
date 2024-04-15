import { useCallback, useContext } from 'react'

import CopyContentAlertDialog from '../components/CopyContentAlertDialog'
import QrErrorMessage from '../components/QrErrorMessage'
import useAlertDialog from './dialog/useAlertDialog'
import useConfirmationDialog from './dialog/useConfirmationDialog'
import useDialog from './dialog/useDialog'
import useInstantOnboarding from './useInstantOnboarding'
import useOpenMailtoLink from './useOpenMailtoLink'
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
  'login',
  'text',
  'url',
  'backup',
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
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()
  const openMailtoLink = useOpenMailtoLink()
  const tx = useTranslationFunction()
  const { screen } = useContext(ScreenContext)
  const { openDialog } = useDialog()
  const { switchToInstantOnboarding } = useInstantOnboarding()

  const setConfigFromQrCatchingErrorInAlert = useCallback(
    async (accountId: number, qrContent: string) => {
      try {
        if (accountId === undefined) {
          throw new Error('error: no context selected')
        }
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

      if (qr.kind === 'account' || qr.kind === 'login') {
        await switchToInstantOnboarding(parsed)
        callback && callback()
        return
      }

      if (qr.kind === 'askVerifyContact') {
        const contact = await BackendRemote.rpc.getContact(
          accountId,
          qr.contact_id
        )

        const userConfirmed = await openConfirmationDialog({
          message: tx('ask_start_chat_with', contact.address),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          const chatId = await BackendRemote.rpc.secureJoin(accountId, url)
          callback && callback(chatId)
        }
      } else if (qr.kind === 'askVerifyGroup') {
        const userConfirmed = await openConfirmationDialog({
          message: tx('qrscan_ask_join_group', qr.grpname),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await BackendRemote.rpc.secureJoin(accountId, url)
          callback && callback()
        }
        return
      } else if (qr.kind === 'fprOk') {
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
      setConfigFromQrCatchingErrorInAlert,
      switchToInstantOnboarding,
      tx,
    ]
  )
}
