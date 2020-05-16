import React, { useContext, useState, useRef } from 'react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogContent } from './DeltaDialog'
import { DeltaButtonDanger } from './SmallDialog'
import { ScreenContext } from '../../contexts'
import { Icon } from '@blueprintjs/core'
import { LocalSettings } from '../../../shared/shared-types'
import { selectChat } from '../../stores/chat'
import QrReader from 'react-qr-reader'
import { Intent, ProgressBar, Card } from '@blueprintjs/core'
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

export async function processOPENPGP4FPRUrl(url: string, callback: any = null) {
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

export function DeltaDialogImportQrInner({
  description,
  onClose,
}: {
  description: string
  onClose: () => void
}) {
  const tx = window.translate
  const [qrCode, setQrCode] = useState('')
  const screenContext = useContext(ScreenContext)
  const [secureJoinOngoing, setSecureJoinOngoing] = useState(false)

  const handleScanResult = (chatId: number = null) => {
    setSecureJoinOngoing(false)
    if (chatId) {
      selectChat(chatId)
    }
    onClose()
  }

  const handleResponse = async (scannedQrCode: string) => {
    setSecureJoinOngoing(true)
    processOPENPGP4FPRUrl(scannedQrCode, handleScanResult)
  }

  const qrImageReader = useRef<any>()

  const handleScan = (data: string) => {
    if (data) {
      handleResponse(data)
    }
  }

  const cancelProcess = () => {
    DeltaBackend.call('stopOngoingProcess')
    onClose()
  }

  const handleError = (err: string) => {
    /* ignore-console-log */
    console.error(err)
  }

  const openImageDialog = () => {
    qrImageReader.current.openImageDialog()
  }

  return (
    <DeltaDialogBody>
      <DeltaDialogContent noPadding>
        {secureJoinOngoing && (
          <div>
            <p className='progress-info'>Secure join in progress...</p>
            <ProgressBar intent={Intent.PRIMARY} value={100} />
            <DeltaButtonDanger onClick={cancelProcess}>
              {tx('cancel')}
            </DeltaButtonDanger>
          </div>
        )}
        {!secureJoinOngoing && (
          <div className='import-qr-code-dialog'>
            <div>
              <div>
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                  facingMode='user'
                />
              </div>
            </div>
            <div className='qr-data'>
              <div className='content' aria-label={tx('a11y_qr_data')}>
                {qrCode}
              </div>
              <div
                title={tx('paste_from_clipboard')}
                className='copy-btn'
                role='button'
                onClick={() => {
                  navigator.clipboard.readText().then(handleResponse)
                }}
              >
                <Icon icon='clipboard' />
              </div>
            </div>
            <button onClick={openImageDialog} className={'bp3-button'}>
              {tx('load_qr_code_as_image')}
            </button>
            <div className='qr-image-loader'>
              <QrReader
                delay={300}
                ref={qrImageReader}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
                legacyMode
              />
            </div>
          </div>
        )}
      </DeltaDialogContent>
    </DeltaDialogBody>
  )
}

export default function ImportQrCode({
  onClose,
  isOpen,
}: {
  onClose: () => void
  isOpen: boolean
  qrCode: string
  deltachat: LocalSettings
}) {
  const tx = window.translate
  const Dialog = DeltaDialog as any // todo remove this cheat.
  return (
    <Dialog title={tx('qrscan_title')} isOpen={isOpen} onClose={onClose}>
      {navigator.onLine && (
        <DeltaDialogImportQrInner description='' onClose={onClose} />
      )}
      {!navigator.onLine && (
        <DeltaDialogContent>
          <DeltaDialogBody>
            <Card>
              <p>{tx('qrshow_join_contact_no_connection_hint')}</p>
            </Card>
            <button onClick={onClose} className={'bp3-button'}>
              <span className='bp3-button-text'>{tx('ok')}</span>
            </button>
            <br />
          </DeltaDialogBody>
        </DeltaDialogContent>
      )}
    </Dialog>
  )
}
