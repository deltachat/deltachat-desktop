import React from 'react'
import { DeltaBackend } from '../../delta-remote'
import { ConfigureProgressDialog } from '../LoginForm'
import { Screens } from '../../ScreenController'
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
import { Backend, selectedAccountId } from '../../backend'

const log = getLogger('renderer/processOpenUrl')

export function ProcessQrCodeDialog({
  onCancel: _onCancel,
  onClose,
  isOpen,
}: DialogProps) {
  const tx = useTranslationFunction()

  const onCancel = async () => {
    await Backend.stopOngoingProcess(selectedAccountId())
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
    await Backend.setConfigFromQr(selectedAccountId(), qrContent)
  } catch (error) {
    if (error instanceof Error) {
      window.__openDialog(AlertDialog, { message: error.message })
    }
  }
}

export default async function processOpenQrUrl(
  url: string,
  callback: any = null
) {
  const tx = window.static_translate

  if (url.toLowerCase().startsWith('mailto:')) {
    log.debug('processing mailto url:', url)
    try {
      const mailto = parseMailto(url)
      const messageText = mailto.subject
        ? mailto.subject + (mailto.body ? '\n\n' + mailto.body : '')
        : mailto.body

      if (mailto.to) {
        let contactId = await DeltaBackend.call(
          'contacts.lookupContactIdByAddr',
          mailto.to
        )
        if (contactId == 0) {
          contactId = await DeltaBackend.call(
            'contacts.createContact',
            mailto.to
          )
        }
        const chatId = await DeltaBackend.call(
          'contacts.createChatByContactId',
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
  // const checkQr: Qr = await Backend.checkQr(selectedAccountId(), url)

  const closeProcessDialog = () => window.__closeDialog(processDialogId)
  let checkQr
  try {
    checkQr = await Backend.checkQr(selectedAccountId(), url)
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

  if (checkQr.type === 'account' && screen !== Screens.Main) {
    closeProcessDialog()
    window.__openDialog('AlertDialog', {
      message: tx('Please login first'),
      cb: callback,
    })
    return
  } else if (checkQr.type === 'account' && screen !== Screens.Welcome) {
    closeProcessDialog()
    window.__openDialog('AlertDialog', {
      message: tx('Please logout first'),
      cb: callback,
    })
    return
  }

  if (checkQr.type === 'account') {
    try {
      await Backend.setConfigFromQr(selectedAccountId(), url)
      closeProcessDialog()
      window.__openDialog(ConfigureProgressDialog, {
        credentials: {},
        onSuccess: () => {
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
    return
  } else if (checkQr.type === 'askVerifyContact') {
    const contact = await DeltaBackend.call(
      'contacts.getContact',
      checkQr.contact_id
    )
    closeProcessDialog()
    window.__openDialog('ConfirmationDialog', {
      message: tx('ask_start_chat_with', contact.address),
      confirmLabel: tx('ok'),
      cb: async (confirmed: boolean) => {
        if (confirmed) {
          DeltaBackend.call('joinSecurejoin', url).then(callback)
        }
      },
    })
  } else if (checkQr.type === 'askVerifyGroup') {
    closeProcessDialog()
    window.__openDialog('ConfirmationDialog', {
      message: tx('qrscan_ask_join_group', checkQr.grpname),
      confirmLabel: tx('ok'),
      cb: (confirmed: boolean) => {
        if (confirmed) {
          DeltaBackend.call('joinSecurejoin', url).then(callback)
        }
        return
      },
    })
  } else if (checkQr.type === 'fprOk') {
    const contact = await DeltaBackend.call(
      'contacts.getContact',
      checkQr.contact_id
    )
    closeProcessDialog()
    window.__openDialog('ConfirmationDialog', {
      message: `The fingerprint of ${contact.displayName} is valid!`,
      confirmLabel: tx('ok'),
      cb: callback,
    })
  } else if (checkQr.type === 'withdrawVerifyContact') {
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
  } else if (checkQr.type === 'reviveVerifyContact') {
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
  } else if (checkQr.type === 'withdrawVerifyGroup') {
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
  } else if (checkQr.type === 'reviveVerifyGroup') {
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
  } else {
    closeProcessDialog()
    window.__openDialog(copyContentAlertDialog, {
      message:
        checkQr.type === 'url'
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
