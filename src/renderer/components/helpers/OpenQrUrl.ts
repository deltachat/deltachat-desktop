import { DeltaBackend } from '../../delta-remote'
import { sendToBackend } from '../../ipc'
import { openMapDialog } from './ChatMethods'
import { ConfigureProgressDialog } from '../LoginForm'
import { Screens } from '../../ScreenController'
import { DeltaChatAccount } from '../../../shared/shared-types'
import { C } from 'deltachat-node'
import { DCInfo } from '../dialogs/About'


export enum QrState {
  AskVerifyContact = C.DC_QR_ASK_VERIFYCONTACT,
  AskVerifyGroup = C.DC_QR_ASK_VERIFYGROUP,
  FprOk = C.DC_QR_FPR_OK,
  FprMissmatch = C.DC_QR_FPR_MISMATCH,
  QrFprWithoutAddr = C.DC_QR_FPR_WITHOUT_ADDR,
  Account = C.DC_QR_ACCOUNT,
  Addr = C.DC_QR_ADDR,
  Text = C.DC_QR_TEXT,
  Url = C.DC_QR_URL,
  Error = C.DC_QR_ERROR,
}

export declare type QrCodeResponse = {
  state: QrState
  id: number
  text1: string
}

export default async function processOpenQrUrl(
  url: string,
  callback: any = null
) {
  const tx = window.static_translate

  const screen = window.__screen


  const checkQr: QrCodeResponse = await DeltaBackend.call('checkQrCode', url)
  console.log(checkQr)
  if (checkQr === null || checkQr.state === QrState.Error || checkQr.state === QrState.Text) {
    window.__openDialog('AlertDialog', {
      message: checkQr.text1 ? checkQr.text1 : tx('import_qr_error'),
      cb: callback,
    })
    return
  }

  if (checkQr.state !== QrState.Account && screen !== Screens.Main
  ) {
    window.__openDialog('AlertDialog', {
      message: tx('Please login first'),
      cb: callback,
    })
    return
  } else if (checkQr.state === QrState.Account && screen !== Screens.Login) {
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
        window.__openDialog(ConfigureProgressDialog, { credentials, onSuccess })
      } else {
        window.__openDialog('AlertDialog', {
          message: tx('qraccount_qr_code_cannot_be_used'),
          cb: callback,
        })
        return
      }
    } catch (err) {
      window.__openDialog('AlertDialog', {
        message: tx('import_qr_error') + ' ' + err,
        cb: callback,
      })
      return
    }
    return
  } else if (checkQr.state ===  QrState.AskVerifyContact) {
    const contact = await DeltaBackend.call('contacts.getContact', checkQr.id)
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
    window.__openDialog('ConfirmationDialog', {
      message: `The fingerprint of ${contact.displayName} is valid!`,
      confirmLabel: tx('ok'),
      cb: callback,
    })
  } else {
    window.__openDialog('AlertDialog', {
      message: "Don't know what to do with this URL :/" + url,
      cb: callback,
    })
  }
}
