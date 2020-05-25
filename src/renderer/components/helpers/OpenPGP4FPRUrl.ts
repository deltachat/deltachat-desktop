import { DeltaBackend } from '../../delta-remote'
import { sendToBackend } from '../../ipc'
const { ipcRenderer } = window.electron_functions

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

const OPENPGP4FPR_SCHEME = 'OPENPGP4FPR'; // yes: uppercase
const DCACCOUNT_SCHEME  = 'DCACCOUNT';
const MAILTO_SCHEME  = 'mailto';
const MATMSG_SCHEME  = 'MATMSG';
const VCARD_SCHEME  = 'BEGIN:VCARD';
const SMTP_SCHEME = 'SMTP';
const HTTP_SCHEME = 'http';
const HTTPS_SCHEME = 'https';

const UrlSchemesAccountRequired = [
  OPENPGP4FPR_SCHEME
];

const UrlSchemesLogoutRequired = [
  DCACCOUNT_SCHEME
];


export declare type QrCodeResponse = {
  state: keyof QrStates
  id: number
  text1: string
}

export default async function processOpenPGP4FPRUrl(url: string, callback: any = null) {
  const tx = window.translate
  let error = false
  const scheme = url.substring(0, url.lastIndexOf(':'));
  const { ready } = await DeltaBackend.call('getState');

  if (UrlSchemesAccountRequired.includes(scheme.toUpperCase()) && !ready) {
    window.__openDialog('AlertDialog', {
      message: tx('Please login first')
    })
    return
  }
  if (url.indexOf(DCACCOUNT_SCHEME) === 0) {
    if (ready) {
      window.__openDialog('AlertDialog', {
        message: tx('Please logout first'),
      })
      return
    }
    try {
      const credentials = await DeltaBackend.call('burnerAccounts.create', url.substr(url.indexOf(':') + 1, url.length))
      sendToBackend('login', {addr: credentials.email, mail_pw: credentials.password});
      ipcRenderer.on('DC_EVENT_CONFIGURE_PROGRESS', (evt, progress) => {
        // close dialog since now the progress bar is shown
        callback()
      })
      
    } catch(err) {
      console.log(err)
    }
    return
  }
  const response: QrCodeResponse = await DeltaBackend.call('checkQrCode', url)
  if (response === null) {
    error = true
  }
  const state = response ? qrStates[response.state] : null
  if (error || state === 'QrError' || state === 'QrText') {
    window.__userFeedback({
      type: 'error',
      text: tx('import_qr_error'),
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
    window.__userFeedback({
      type: 'error',
      text: 'Don\'t know what to do with this URL :/',
    })
  }
}
