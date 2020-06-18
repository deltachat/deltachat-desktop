import { DeltaBackend } from '../../delta-remote'
import { sendToBackend } from '../../ipc'
import { openMapDialog } from './ChatMethods'
import { ConfigureProgressDialog } from '../LoginForm'
import { Screens } from '../../ScreenController'

interface QrStates {
  [key: number]: string
}

export const qrStates: QrStates = {
  200: 'QrAskVerifyContact', // id = contact
  202: 'QrAskVerifyGroup', // text1=groupname
  210: 'QrFprOk', // finger print ok for id=contact
  220: 'QrFprMissmatch', // finger print not ok for id=contact
  230: 'QrFprWithoutAddr',
  250: 'QrAccount', // text1=domain
  320: 'QrAddr', // id=contact
  330: 'QrText', // text1=text
  332: 'QrUrl', // text1=URL
  400: 'QrError', // text1=error string
}

const OPENPGP4FPR_SCHEME = 'OPENPGP4FPR' // yes: uppercase
const DCACCOUNT_SCHEME = 'DCACCOUNT'
const MAILTO_SCHEME = 'mailto'
const MATMSG_SCHEME = 'MATMSG'
const VCARD_SCHEME = 'BEGIN:VCARD'
const SMTP_SCHEME = 'SMTP'
const HTTP_SCHEME = 'http'
const HTTPS_SCHEME = 'https'

const UrlSchemesAccountRequired = [OPENPGP4FPR_SCHEME]

const UrlSchemesLogoutRequired = [DCACCOUNT_SCHEME]

export declare type QrCodeResponse = {
  state: keyof QrStates
  id: number
  text1: string
}

export default async function processOpenQrUrl(
  url: string,
  callback: any = null
) {
  const tx = window.translate
  let error = false
  const scheme = url.substring(0, url.lastIndexOf(':'))
  const { ready } = await DeltaBackend.call('getState')

  if (UrlSchemesAccountRequired.includes(scheme.toUpperCase()) && !ready) {
    window.__openDialog('AlertDialog', {
      message: tx('Please login first'),
      cb: callback,
    })
    return
  }
  if (url.indexOf(DCACCOUNT_SCHEME) === 0) {
    if (ready) {
      window.__openDialog('AlertDialog', {
        message: tx('Please logout first'),
        cb: callback,
      })
      return
    }
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

        const onSuccess = () => {
          window.__changeScreen(Screens.Main)
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
        message: tx('import_qr_error'),
        cb: callback,
      })
      return
    }
    return
  }
  const response: QrCodeResponse = await DeltaBackend.call('checkQrCode', url)
  if (response === null) {
    error = true
  }
  const state = response ? qrStates[response.state] : null
  if (error || state === 'QrError' || state === 'QrText') {
    window.__openDialog('AlertDialog', {
      message: tx('import_qr_error'),
      cb: callback,
    })
    return
  }

  if (state === 'QrAskVerifyContact') {
    const contact = await DeltaBackend.call('contacts.getContact', response.id)
    window.__openDialog('ConfirmationDialog', {
      message: tx('ask_start_chat_with', contact.address),
      confirmLabel: tx('ok'),
      cb: async (confirmed: boolean) => {
        if (confirmed) {
          DeltaBackend.call('joinSecurejoin', url).then(callback)
        }
      },
    })
  } else if (state === 'QrAskVerifyGroup') {
    window.__openDialog('ConfirmationDialog', {
      message: tx('qrscan_ask_join_group', response.text1),
      confirmLabel: tx('ok'),
      cb: (confirmed: boolean) => {
        if (confirmed) {
          DeltaBackend.call('joinSecurejoin', url).then(callback)
        }
        return
      },
    })
  } else if (state === 'QrFprOk') {
    const contact = await DeltaBackend.call('contacts.getContact', response.id)
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
