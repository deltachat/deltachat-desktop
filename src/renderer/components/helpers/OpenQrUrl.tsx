import React from 'react'
import { Spinner } from '@blueprintjs/core'

import { ConfigureProgressDialog } from '../LoginForm'
import { Screens, selectedAccountId } from '../../ScreenController'
import {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogBody,
  DeltaDialogContent,
  SmallDialog,
} from '../dialogs/DeltaDialog'
import { runtime } from '../../runtime'
import { getLogger } from '../../../shared/logger'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import AlertDialog from '../dialogs/AlertDialog'
import { EffectfulBackendActions } from '../../backend-com'
import { BackendRemote, Type } from '../../backend-com'
import { ImportBackupTransferProgressDialog } from '../dialogs/setup_multi_device/ReceiveBackup'
import processMailtoUrl from './MailtoUrl'
import { useTranslationFunction } from '../../hooks/useTranslationFunction'

import type {
  CloseDialog,
  DialogProps,
  OpenDialog,
} from '../../contexts/DialogContext'

const log = getLogger('renderer/processOpenUrl')

export function ProcessQrCodeDialog({
  onCancel,
  onClose,
}: DialogProps & {
  onCancel: () => Promise<void>
}) {
  const tx = useTranslationFunction()

  const handleCancel = async () => {
    window.__selectedAccountId &&
      (await BackendRemote.rpc.stopOngoingProcess(window.__selectedAccountId))
    onCancel && onCancel()
    onClose()
  }

  return (
    <SmallDialog onClose={onClose}>
      <DeltaDialogBody>
        <DeltaDialogContent style={{ height: '80px', padding: '20px' }}>
          <Spinner />
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <p className='delta-button bold primary' onClick={handleCancel}>
            {tx('cancel')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}

async function setConfigFromQrCatchingErrorInAlert(
  openDialog: OpenDialog,
  qrContent: string
) {
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
      openDialog(AlertDialog, { message: error.message })
    }
  }
}

export default async function processOpenQrUrl(
  openDialog: OpenDialog,
  closeDialog: CloseDialog,
  url: string,
  callback: any = null,
  skipLoginConfirmation = false
) {
  const tx = window.static_translate

  if (url.toLowerCase().startsWith('mailto:')) {
    processMailtoUrl(openDialog, url, callback)
    return
  }

  const screen = window.__screen

  const processDialogId = openDialog(ProcessQrCodeDialog)

  const closeProcessDialog = () => closeDialog(processDialogId)
  let checkQr
  try {
    checkQr = await BackendRemote.rpc.checkQr(selectedAccountId(), url)
  } catch (err) {
    checkQr = null
    log.error(err)
  }

  if (checkQr === null) {
    closeProcessDialog()
    openDialog(AlertDialog, {
      message: (
        <>
          {tx('qrscan_failed')}
          <br />
          <br />
          {url}
        </>
      ),
      cb: callback,
    })
    return
  }

  const allowedQrCodesOnWelcomeScreen: Type.Qr['kind'][] = [
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
    openDialog(AlertDialog, {
      message: tx('Please login first'),
      cb: callback,
    })
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

      const yes = await new Promise(resolve => {
        openDialog(ConfirmationDialog, {
          message: tx(message, replacementValue),
          cb: resolve,
          confirmLabel: tx('login'),
        })
      })

      if (!yes) {
        callback && callback()
        return
      }
    }

    if (screen !== Screens.Welcome) {
      // log out first
      await EffectfulBackendActions.logout()
      window.__selectAccount(await BackendRemote.rpc.addAccount())

      callback && callback()
      // define callback to call this function again, skipping the question
      window.__welcome_qr = url
    } else {
      try {
        if (window.__selectedAccountId === undefined) {
          throw new Error('error: no context selected')
        }
        await BackendRemote.rpc.setConfigFromQr(window.__selectedAccountId, url)
        closeProcessDialog()
        openDialog(ConfigureProgressDialog, {
          credentials: {},
          onSuccess: () => {
            window.__askForName = true
            window.__changeScreen(Screens.Main)
            callback()
          },
        })
      } catch (err: any) {
        closeProcessDialog()
        openDialog(AlertDialog, {
          message: err.message || err.toString(),
          cb: callback,
        })
        return
      }
    }

    return
  } else if (checkQr.kind === 'askVerifyContact') {
    const accountId = selectedAccountId()
    const contact = await BackendRemote.rpc.getContact(
      accountId,
      checkQr.contact_id
    )
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: tx('ask_start_chat_with', contact.address),
      confirmLabel: tx('ok'),
      cb: (confirmed: boolean) => {
        if (confirmed) {
          BackendRemote.rpc.secureJoin(accountId, url).then(callback)
        }
      },
    })
  } else if (checkQr.kind === 'askVerifyGroup') {
    const accountId = selectedAccountId()
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: tx('qrscan_ask_join_group', checkQr.grpname),
      confirmLabel: tx('ok'),
      cb: (confirmed: boolean) => {
        if (confirmed) {
          BackendRemote.rpc.secureJoin(accountId, url).then(callback)
        }
        return
      },
    })
  } else if (checkQr.kind === 'fprOk') {
    const accountId = selectedAccountId()
    const contact = await BackendRemote.rpc.getContact(
      accountId,
      checkQr.contact_id
    )
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: `The fingerprint of ${contact.displayName} is valid!`,
      confirmLabel: tx('ok'),
      cb: callback,
    })
  } else if (checkQr.kind === 'withdrawVerifyContact') {
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: tx('withdraw_verifycontact_explain'),
      header: tx('withdraw_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(openDialog, url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'reviveVerifyContact') {
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: tx('revive_verifycontact_explain'),
      header: tx('revive_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(openDialog, url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'withdrawVerifyGroup') {
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: tx('withdraw_verifygroup_explain', checkQr.grpname),
      header: tx('withdraw_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(openDialog, url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'reviveVerifyGroup') {
    closeProcessDialog()
    openDialog(ConfirmationDialog, {
      message: tx('revive_verifygroup_explain', checkQr.grpname),
      header: tx('revive_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(openDialog, url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'backup') {
    closeProcessDialog()
    if (screen === Screens.Main) {
      openDialog(AlertDialog, {
        message: tx('Please logout first'),
        cb: callback,
      })
    } else {
      openDialog(ImportBackupTransferProgressDialog, {
        QrWithToken: url,
      })
    }
    callback(null)
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
}

function CopyContentAlertDialog({
  onClose,
  message,
  content,
  cb,
}: DialogProps & { message: string; content: string; cb: () => void }) {
  const tx = useTranslationFunction()

  return (
    <SmallDialog onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p style={{ wordBreak: 'break-word' }}>{message}</p>
      </div>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <p
            className='delta-button bold primary'
            onClick={() => {
              runtime.writeClipboardText(content).then(onClose)
            }}
          >
            {tx('global_menu_edit_copy_desktop')}
          </p>
          <p
            className='delta-button bold primary'
            onClick={() => {
              cb && cb()
              onClose()
            }}
          >
            {tx('ok')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
