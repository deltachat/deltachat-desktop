import { DeltaBackend } from '../../delta-remote'

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

export declare type QrCodeResponse = {
  state: keyof QrStates
  id: number
  text1: string
}

export default async function processOpenPGP4FPRUrl(url: string, callback: any = null) {
  const tx = window.translate
  let error = false
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
      text: "Don't know what to do with this URL :/",
    })
  }
}
