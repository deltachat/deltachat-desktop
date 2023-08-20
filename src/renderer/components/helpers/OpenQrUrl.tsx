import React from 'react'
import { ConfigureProgressDialog } from '../LoginForm'
import { Screens, selectedAccountId } from '../../ScreenController'
import { useTranslationFunction } from '../../contexts'
import {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogBody,
  DeltaDialogContent,
  SmallDialog,
} from '../dialogs/DeltaDialog'
import { Spinner } from '@blueprintjs/core'
import { DialogProps } from '../dialogs/DialogController'
import { runtime } from '../../runtime'
import { parseMailto } from '../../../shared/parse_mailto'
import MailtoDialog, { doMailtoAction } from '../dialogs/MailtoDialog'
import { getLogger } from '../../../shared/logger'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import AlertDialog from '../dialogs/AlertDialog'
import { selectChat } from './ChatMethods'
import { EffectfulBackendActions } from '../../backend-com'
import { BackendRemote, Type } from '../../backend-com'
import { ImportBackupTransferProgressDialog } from '../dialogs/setup_multi_device/ReceiveBackup'

const log = getLogger('renderer/processOpenUrl')

export function ProcessQrCodeDialog({
  onCancel: _onCancel,
  onClose,
  isOpen,
}: DialogProps) {
  const tx = useTranslationFunction()

  const onCancel = async () => {
    window.__selectedAccountId &&
      (await BackendRemote.rpc.stopOngoingProcess(window.__selectedAccountId))
    _onCancel && _onCancel()
    onClose()
  }

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <DeltaDialogBody>
        <DeltaDialogContent style={{ height: '80px', padding: '20px' }}>
          <Spinner />
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter style={{ padding: '0px 20px 10px' }}>
        <DeltaDialogFooterActions>
          <p className='delta-button bold primary' onClick={onCancel}>
            {tx('cancel')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}

async function setConfigFromQrCatchingErrorInAlert(qrContent: string) {
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
      window.__openDialog(AlertDialog, { message: error.message })
    }
  }
}

export default async function processOpenQrUrl(
  url: string,
  callback: any = null,
  skipLoginConfirmation = false
) {
  const tx = window.static_translate

  if (url.toLowerCase().startsWith('mailto:')) {
    log.debug('processing mailto url:', url)
    try {
      const accountId = selectedAccountId()
      const mailto = parseMailto(url)
      const messageText = mailto.subject
        ? mailto.subject + (mailto.body ? '\n\n' + mailto.body : '')
        : mailto.body

      if (mailto.to) {
        let contactId = await BackendRemote.rpc.lookupContactIdByAddr(
          accountId,
          mailto.to
        )
        if (contactId === null) {
          contactId = await BackendRemote.rpc.createContact(
            accountId,
            mailto.to,
            null
          )
        }
        const chatId = await BackendRemote.rpc.createChatByContactId(
          accountId,
          contactId
        )
        if (messageText) {
          await doMailtoAction(chatId, messageText)
        } else {
          selectChat(chatId)
        }
      } else {
        if (messageText) {
          window.__openDialog(MailtoDialog, { messageText })
        }
      }
      callback && callback()
    } catch (error) {
      log.error('mailto decoding error', error)
      window.__openDialog('AlertDialog', {
        message: tx('mailto_link_could_not_be_decoded', url),
        cb: callback,
      })
    }
    return
  }

  const screen = window.__screen

  const processDialogId = window.__openDialog(ProcessQrCodeDialog)
  // const checkQr: Qr = await BackendRemote.rpc.checkQr(selectedAccountId(), url)

  const closeProcessDialog = () => window.__closeDialog(processDialogId)
  let checkQr
  try {
    checkQr = await BackendRemote.rpc.checkQr(selectedAccountId(), url)
  } catch (err) {
    checkQr = null
    log.error(err)
  }

  if (checkQr === null) {
    closeProcessDialog()
    window.__openDialog(AlertDialog, {
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
    window.__openDialog('AlertDialog', {
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
        window.__openDialog(ConfirmationDialog, {
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
        window.__openDialog(ConfigureProgressDialog, {
          credentials: {},
          onSuccess: () => {
            window.__askForName = true
            window.__changeScreen(Screens.Main)
            callback()
          },
        })
      } catch (err: any) {
        closeProcessDialog()
        window.__openDialog('AlertDialog', {
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
    window.__openDialog('ConfirmationDialog', {
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
    window.__openDialog('ConfirmationDialog', {
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
    window.__openDialog('ConfirmationDialog', {
      message: `The fingerprint of ${contact.displayName} is valid!`,
      confirmLabel: tx('ok'),
      cb: callback,
    })
  } else if (checkQr.kind === 'withdrawVerifyContact') {
    closeProcessDialog()
    window.__openDialog(ConfirmationDialog, {
      message: tx('withdraw_verifycontact_explain'),
      header: tx('withdraw_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'reviveVerifyContact') {
    closeProcessDialog()
    window.__openDialog(ConfirmationDialog, {
      message: tx('revive_verifycontact_explain'),
      header: tx('revive_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'withdrawVerifyGroup') {
    closeProcessDialog()
    window.__openDialog(ConfirmationDialog, {
      message: tx('withdraw_verifygroup_explain', checkQr.grpname),
      header: tx('withdraw_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'reviveVerifyGroup') {
    closeProcessDialog()
    window.__openDialog(ConfirmationDialog, {
      message: tx('revive_verifygroup_explain', checkQr.grpname),
      header: tx('revive_qr_code'),
      confirmLabel: tx('ok'),
      cb: async yes => {
        if (yes) {
          await setConfigFromQrCatchingErrorInAlert(url)
        }
        callback(null)
      },
    })
  } else if (checkQr.kind === 'backup') {
    closeProcessDialog()
    if (screen === Screens.Main) {
      window.__openDialog('AlertDialog', {
        message: tx('Please logout first'),
        cb: callback,
      })
    } else {
      window.__openDialog(ImportBackupTransferProgressDialog, {
        QrWithToken: url,
      })
    }
    callback(null)
    return
  } else {
    closeProcessDialog()
    window.__openDialog(copyContentAlertDialog, {
      message:
        checkQr.kind === 'url'
          ? tx('qrscan_contains_url', url)
          : tx('qrscan_contains_text', url),
      content: url,
      cb: callback,
    })
  }
}

function copyContentAlertDialog({
  isOpen,
  onClose,
  message,
  content,
  cb,
}: DialogProps & { message: string; content: string; cb: () => void }) {
  const tx = window.static_translate
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
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
