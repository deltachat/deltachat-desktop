import { useCallback, useContext } from 'react'

import CopyContentAlertDialog from '../components/CopyContentAlertDialog'
import ProcessQrCodeDialog from '../components/ProcessQrCodeDialog'
import QrErrorMessage from '../components/QrErrorMessage'
import useAlertDialog from './dialog/useAlertDialog'
import useConfirmationDialog from './dialog/useConfirmationDialog'
import useDialog from './dialog/useDialog'
import useOpenMailtoLink from './useOpenMailtoLink'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'
import { ScreenContext } from '../contexts/ScreenContext'
import { ConfigureProgressDialog } from '../components/LoginForm'
import { ReceiveBackupDialog } from '../components/dialogs/SetupMultiDevice'
import { Screens } from '../ScreenController'
import { getLogger } from '../../shared/logger'

import type { T } from '@deltachat/jsonrpc-client'

const log = getLogger('renderer/hooks/useQR')

export default function useProcessQR() {
  const openAlertDialog = useAlertDialog()
  const openConfirmationDialog = useConfirmationDialog()
  const openMailtoLink = useOpenMailtoLink()
  const tx = useTranslationFunction()
  const { screen } = useContext(ScreenContext)
  const { openDialog, closeDialog } = useDialog()

  const setConfigFromQrCatchingErrorInAlert = useCallback(
    async (qrContent: string) => {
      try {
        if (window.__selectedAccountId === undefined) {
          throw new Error('error: no context selected')
        }
        await BackendRemote.rpc.setConfigFromQr(
          window.__selectedAccountId,
          qrContent
        )
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
      callback?: (chatId?: number) => void,
      skipLoginConfirmation?: boolean
    ) => {
      if (url.toLowerCase().startsWith('mailto:')) {
        await openMailtoLink(accountId, url, callback)
        return
      }

      const processDialogId = openDialog(ProcessQrCodeDialog)
      const closeProcessDialog = () => closeDialog(processDialogId)

      let checkQr = null
      try {
        checkQr = await BackendRemote.rpc.checkQr(accountId, url)
      } catch (err) {
        log.error(err)
      }

      if (checkQr === null) {
        closeProcessDialog()
        await openAlertDialog({
          message: QrErrorMessage({ url }),
        })
        callback && callback()
        return
      }

      const allowedQrCodesOnWelcomeScreen: T.Qr['kind'][] = [
        'account',
        'login',
        'text',
        'url',
        'backup',
      ]

      if (
        !allowedQrCodesOnWelcomeScreen.includes(checkQr.kind) &&
        screen !== Screens.Main
      ) {
        closeProcessDialog()
        await openAlertDialog({
          message: tx('Please login first'),
        })
        callback && callback()
        return
      }

      if (checkQr.kind === 'account' || checkQr.kind === 'login') {
        closeProcessDialog()

        if (!skipLoginConfirmation) {
          // ask if user wants it
          const is_singular_term =
            (await BackendRemote.rpc.getAllAccountIds()).length == 1

          const message: string =
            checkQr.kind === 'account'
              ? is_singular_term
                ? 'qraccount_ask_create_and_login'
                : 'qraccount_ask_create_and_login_another'
              : checkQr.kind === 'login'
                ? is_singular_term
                  ? 'qrlogin_ask_login'
                  : 'qrlogin_ask_login_another'
                : '?'

          const replacementValue =
            checkQr.kind === 'account'
              ? checkQr.domain
              : checkQr.kind === 'login'
                ? checkQr.address
                : ''

          const userConfirmed = await openConfirmationDialog({
            message: tx(message, replacementValue),
            confirmLabel: tx('login_title'),
          })

          if (!userConfirmed) {
            callback && callback()
            return
          }
        }

        if (screen !== Screens.Welcome) {
          // log out first (not needed anymore as selectAccount does this automatically now)
          window.__selectAccount(await BackendRemote.rpc.addAccount())

          callback && callback()
          // define callback to call this function again, skipping the question
          window.__welcome_qr = url
        } else {
          try {
            if (window.__selectedAccountId === undefined) {
              throw new Error('error: no context selected')
            }
            await BackendRemote.rpc.setConfigFromQr(
              window.__selectedAccountId,
              url
            )
            closeProcessDialog()
            openDialog(ConfigureProgressDialog, {
              credentials: {},
              onSuccess: () => {
                window.__askForName = true
                window.__changeScreen(Screens.Main)
                callback && callback()
              },
            })
          } catch (err: any) {
            closeProcessDialog()
            openAlertDialog({
              message: err.message || err.toString(),
            })
            callback && callback()
            return
          }
        }

        return
      } else if (checkQr.kind === 'askVerifyContact') {
        const contact = await BackendRemote.rpc.getContact(
          accountId,
          checkQr.contact_id
        )

        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: tx('ask_start_chat_with', contact.address),
          confirmLabel: tx('ok'),
        })

        let chatId
        if (userConfirmed) {
          chatId = await BackendRemote.rpc.secureJoin(accountId, url)
        }
        callback && callback(chatId)
      } else if (checkQr.kind === 'askVerifyGroup') {
        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: tx('qrscan_ask_join_group', checkQr.grpname),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await BackendRemote.rpc.secureJoin(accountId, url)
        }

        callback && callback()
        return
      } else if (checkQr.kind === 'fprOk') {
        const contact = await BackendRemote.rpc.getContact(
          accountId,
          checkQr.contact_id
        )

        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: `The fingerprint of ${contact.displayName} is valid!`,
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          callback && callback()
        }
      } else if (checkQr.kind === 'withdrawVerifyContact') {
        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifycontact_explain'),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }

        callback && callback()
      } else if (checkQr.kind === 'reviveVerifyContact') {
        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: tx('revive_verifycontact_explain'),
          header: tx('revive_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }

        callback && callback()
      } else if (checkQr.kind === 'withdrawVerifyGroup') {
        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: tx('withdraw_verifygroup_explain', checkQr.grpname),
          header: tx('withdraw_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }

        callback && callback()
      } else if (checkQr.kind === 'reviveVerifyGroup') {
        closeProcessDialog()

        const userConfirmed = await openConfirmationDialog({
          message: tx('revive_verifygroup_explain', checkQr.grpname),
          header: tx('revive_qr_code'),
          confirmLabel: tx('ok'),
        })

        if (userConfirmed) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }

        callback && callback()
      } else if (checkQr.kind === 'backup') {
        closeProcessDialog()

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
        closeProcessDialog()
        openDialog(CopyContentAlertDialog, {
          message:
            checkQr.kind === 'url'
              ? tx('qrscan_contains_url', url)
              : tx('qrscan_contains_text', url),
          content: url,
          cb: callback,
        })
      }
    },
    [
      closeDialog,
      openAlertDialog,
      openConfirmationDialog,
      openDialog,
      openMailtoLink,
      screen,
      setConfigFromQrCatchingErrorInAlert,
      tx,
    ]
  )
}
