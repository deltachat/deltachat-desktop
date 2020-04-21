import React, { useContext, useState, useRef } from 'react'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
} from './DeltaDialog'
import { ScreenContext } from '../../contexts'
import { Icon } from '@blueprintjs/core'
import { LocalSettings, ChatListItemType } from '../../../shared/shared-types'
import { callDcMethodAsync, callDcMethod } from '../../ipc'
const { ipcRenderer } = window.electron_functions
import { selectChat } from '../../stores/chat'
import QrReader from 'react-qr-reader'
import { Intent, ProgressBar } from '@blueprintjs/core'
import * as logger from '../../../shared/logger'

const log = logger.getLogger('dialogs/importQrCode')

interface QrStates {
  [key: number]: string
}

const qrStates: QrStates = {
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

declare type QrCodeResponse = {
  state: keyof QrStates
  id: number
  text1: string
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
  const [useCamera, setUseCamera] = useState(false)
  const screenContext = useContext(ScreenContext)
  const [secureJoinOngoing, setSecureJoinOngoing] = useState(false)

  const handleResponse = async (scannedQrCode: string) => {
    setQrCode(scannedQrCode)
    let error = false
    const response: QrCodeResponse = await callDcMethodAsync('checkQrCode', scannedQrCode)

    if (response === null) error = true

    const state = qrStates[response.state]
    if (error || state === 'QrError' || state === 'QrText') {
      screenContext.userFeedback({
        type: 'error',
        text: tx('import_qr_error'),
      })
      return
    }

    const selectChatAndClose = (chatId: number) => {
      log.debug('selectChatAndClose chatId:', chatId)
      selectChat(chatId)
      onClose()
    }

    if (state === 'QrAskVerifyContact') {
      const contact = await callDcMethodAsync(
        'contacts.getContact',
        response.id
      )
      screenContext.openDialog('ConfirmationDialog', {
        message: tx('ask_start_chat_with', contact.address),
        confirmLabel: tx('ok'),
        cb: async (confirmed: boolean) => {
          if (!confirmed) return
          setSecureJoinOngoing(true)
          ipcRenderer.once(
            'DC_EVENT_SECUREJOIN_FAILED',
            (evt: Event, payload: any) => {
              log.error('DC_EVENT_SECUREJOIN_FAILED', payload)
            }
          )
          const chatId:number = await callDcMethodAsync('joinSecurejoin', scannedQrCode)
          if (chatId !== 0) selectChatAndClose(chatId)
        },
      })
    } else if (state === 'QrAskVerifyGroup') {
      screenContext.openDialog('ConfirmationDialog', {
        message: tx('qrscan_ask_join_group', response.text1),
        confirmLabel: tx('ok'),
        cb: async (confirmed: boolean) => {
          if (!confirmed) return
          setSecureJoinOngoing(true)
          ipcRenderer.once('DC_EVENT_SECUREJOIN_FAILED', (evt: Event, payload: any) => {
            log.error('DC_EVENT_SECUREJOIN_FAILED', payload)
          })
          const chatId:number = await callDcMethodAsync('joinSecurejoin', scannedQrCode)
          if (chatId !== 0) selectChatAndClose(chatId)
        },
      })
    }
  }

  const qrImageReader = useRef<any>()

  const handleScan = (data: string) => {
    log.debug('handleScan:', data)
    if (data) {
      handleResponse(data)
    }
  }

  const handleError = (err: string) => log.error('QR Scanning eror:', err)
  const toggleCamera = () => setUseCamera(!useCamera)
  const openImageDialog = () => qrImageReader.current.openImageDialog()

  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noOverflow noPadding>
          {secureJoinOngoing && (
            <div>
              <p className='progress-info'>Secure join in progress...</p>
              <ProgressBar intent={Intent.PRIMARY} value={100} />
            </div>
          )}
          {!secureJoinOngoing && (
            <div className='import-qr-code-dialog'>
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
              {!useCamera && (
                <button
                  aria-label={tx('scan_with_camera')}
                  onClick={toggleCamera}
                  className={'bp3-button'}
                >
                  {tx('scan_with_camera')}
                </button>
              )}
              {useCamera && (
                <div>
                  <button
                    aria-label={tx('cancel_camera')}
                    onClick={toggleCamera}
                    className={'bp3-button'}
                  >
                    {tx('cancel_camera')}
                  </button>
                  <div>
                    <QrReader
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
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
    </>
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
    <Dialog title={tx('import_qr_title')} isOpen={isOpen} onClose={onClose}>
      <DeltaDialogImportQrInner description='' onClose={onClose} />
    </Dialog>
  )
}