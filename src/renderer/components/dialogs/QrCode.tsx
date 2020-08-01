import React, { useState, useContext, useRef } from 'react'
import { DeltaDialogBase, DeltaDialogFooter, DeltaDialogFooterActions, DeltaDialogBody, DeltaDialogContent } from './DeltaDialog'
import { DialogProps } from './DialogController'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import classNames from 'classnames'
import qr from 'react-qr-svg'
import QrReader from 'react-qr-reader'
import { Spinner } from '@blueprintjs/core'
import { selectChat } from '../../stores/chat'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import { DeltaBackend } from '../../delta-remote'

export default function QrCode({isOpen, onClose, deltachat, qrCode}: DialogProps) {
    const [showQrCode, setShowQrCode] = useState(true)
 
    const tx = useTranslationFunction()
 
    return (
      <DeltaDialogBase
        isOpen={isOpen}
        onClose={onClose}
      >
          <div className='qr-code-switch'>
            <p className={classNames({active: showQrCode})} onClick={() => setShowQrCode(true)}>{tx('qrshow_title')}</p>
            <p className={classNames({active: ! showQrCode})} onClick={() => setShowQrCode(false)}>{tx('qrscan_title')}</p>
          </div>
          { showQrCode &&
            <DeltaDialogShowQrInner
              description={tx('qrshow_join_contact_hint', [
                deltachat.credentials.addr,
              ])}
              qrCode={qrCode}
              onClose={onClose}
            />
          }
          { !showQrCode &&
            <DeltaDialogScanQrInner description='' onClose={onClose} />
          }
      </DeltaDialogBase>
    )
}


export function DeltaDialogShowQrInner({
  qrCode,
  description,
  onClose
}: {
  qrCode: string
  description: string
  onClose: todo
}) {
  const { userFeedback } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  const onCopy = () => {
    navigator.clipboard.writeText(qrCode).then(_ =>
      userFeedback({
        type: 'success',
        text: tx('a11y_copy_qr_data'),
      })
    )
  }


  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noOverflow noPadding style={{paddingTop: '20px'}}>
            <qr.QRCode
              bgColor='#FFFFFF'
              fgColor='#000000'
              level='Q'
              value={qrCode}
              style={{ height: 'calc(500px - 58px)', padding: '0px 20px', backgroundColor: 'white' }}
            />
            <p style={{ textAlign: 'center', marginTop: '10px' }}>{description}</p>
          </DeltaDialogContent>
      </DeltaDialogBody>
        <DeltaDialogFooter>
          <DeltaDialogFooterActions style={{justifyContent: 'space-between'}}>
              <p className={'delta-button bold primary'} onClick={onCopy}>
                {tx('global_menu_edit_copy_desktop')}
              </p>
            <p className={'delta-button bold primary'} onClick={onClose}>
              {tx('close')}
            </p>
          </DeltaDialogFooterActions>
        </DeltaDialogFooter>
    </>
  )
}


export function DeltaDialogScanQrInner({
  description,
  onClose,
}: {
  description: string
  onClose: () => void
}) {
  const tx = window.static_translate
  const [qrCode, setQrCode] = useState('')
  const [processQrCode, setProcessQrCode] = useState(false)

  const handleScanResult = (chatId: number = null) => {
    setProcessQrCode(false)
    chatId && selectChat(chatId)
    onClose()
  }

  const handleResponse = async (scannedQrCode: string) => {
    setProcessQrCode(true)
    processOpenQrUrl(scannedQrCode, handleScanResult)
  }

  const qrImageReader = useRef<any>()

  const handleScan = (data: string) => {
    data && handleResponse(data)
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
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noPadding>
          {processQrCode && (
            <div>
              <Spinner />
              <p />
              <p className='delta-button danger' onClick={cancelProcess}>
                {tx('cancel')}
              </p>
            </div>
          )}
          {!processQrCode && (
            <div className='import-qr-code-dialog'>
              <div style={{marginBottom: '-18px'}}>
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
              <p className='scan-qr-description'>{tx('qrscan_hint')}</p>
            </div>
          )}
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <DeltaDialogFooterActions style={{justifyContent: 'space-between'}}>
            <p className={'delta-button bold primary'} onClick={openImageDialog}>
              {tx('load_qr_code_as_image')}
            </p>
          <p className={'delta-button bold primary'} onClick={onClose}>
            {tx('close')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </>
  )
}