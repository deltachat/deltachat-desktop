import React from 'react'
import { DeltaBackend } from '../../delta-remote'
import { ConfigureProgressDialog } from '../LoginForm'
import { Screens } from '../../ScreenController'
import { DeltaChatAccount } from '../../../shared/shared-types'
import { QrState } from '../../../shared/constants'
import { QrCodeResponse } from '../../../shared/shared-types'
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
import { parseMailto } from './parse_mailto'
import MailtoDialog, { doMailtoAction } from '../dialogs/MailtoDialog'
import { getLogger } from '../../../shared/logger'
import { selectChat } from '../../stores/chat'

const log = getLogger('renderer/processOpenUrl')

export function ProcessQrCodeDialog({
  onCancel: _onCancel,
  onClose,
  isOpen,
}: DialogProps) {
  const tx = useTranslationFunction()

  const onCancel = () => {
    DeltaBackend.call('stopOngoingProcess')
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
          'contacts.getDMChatId',
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
  const checkQr: QrCodeResponse = await DeltaBackend.call('checkQrCode', url)

  const closeProcessDialog = () => window.__closeDialog(processDialogId)

  if (checkQr === null || checkQr.state === QrState.Error) {
    closeProcessDialog()
    window.__openDialog('AlertDialog', {
      message: tx('import_qr_error'),
      cb: callback,
    })
    return
  }

  if (checkQr.state !== QrState.Account && screen !== Screens.Main) {
    closeProcessDialog()
    window.__openDialog('AlertDialog', {
      message: tx('Please login first'),
      cb: callback,
    })
    return
  } else if (checkQr.state === QrState.Account && screen !== Screens.Login) {
    closeProcessDialog()
    window.__openDialog('AlertDialog', {
      message: tx('Please logout first'),
      cb: callback,
    })
    return
  }

  if (checkQr.state === QrState.Account) {
    try {
      const burnerAccount = await DeltaBackend.call(
        'burnerAccounts.create',
        url.substr(url.indexOf(':') + 1, url.length)
      )
      if (burnerAccount && burnerAccount.email && burnerAccount.password) {
        const credentials = {
          addr: burnerAccount.email,
          mail_pw: burnerAccount.password,
        }

        const onSuccess = (account: DeltaChatAccount) => {
          window.__loadAccount(account)
          callback()
        }
        closeProcessDialog()
        window.__openDialog(ConfigureProgressDialog, { credentials, onSuccess })
      } else {
        closeProcessDialog()
        window.__openDialog('AlertDialog', {
          message: tx('qraccount_qr_code_cannot_be_used'),
          cb: callback,
        })
        return
      }
    } catch (err) {
      closeProcessDialog()
      window.__openDialog('AlertDialog', {
        message: tx('import_qr_error') + ': ' + err,
        cb: callback,
      })
      return
    }
    return
  } else if (checkQr.state === QrState.AskVerifyContact) {
    const contact = await DeltaBackend.call('contacts.getContact', checkQr.id)
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
  } else if (checkQr.state === QrState.AskVerifyGroup) {
    closeProcessDialog()
    window.__openDialog('ConfirmationDialog', {
      message: tx('qrscan_ask_join_group', checkQr.text1),
      confirmLabel: tx('ok'),
      cb: (confirmed: boolean) => {
        if (confirmed) {
          DeltaBackend.call('joinSecurejoin', url).then(callback)
        }
        return
      },
    })
  } else if (checkQr.state === QrState.FprOk) {
    const contact = await DeltaBackend.call('contacts.getContact', checkQr.id)
    closeProcessDialog()
    window.__openDialog('ConfirmationDialog', {
      message: `The fingerprint of ${contact.displayName} is valid!`,
      confirmLabel: tx('ok'),
      cb: callback,
    })
  } else {
    closeProcessDialog()
    window.__openDialog(copyContentAlertDialog, {
      message:
        checkQr.state === QrState.Url
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
      <div className='bp3-dialog-body-with-padding'>
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
