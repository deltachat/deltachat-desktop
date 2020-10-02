import React, { useState, useContext, useRef, useEffect } from 'react'
import {
  DeltaDialogBase,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogBody,
  DeltaDialogContent,
  SmallDialog,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import classNames from 'classnames'
import qr from 'react-qr-svg'
import QrReader from 'react-qr-reader'
import { Spinner } from '@blueprintjs/core'
import { selectChat } from '../../stores/chat'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import { DeltaBackend } from '../../delta-remote'
import { openMapDialog } from '../helpers/ChatMethods'
import { ConfigureProgressDialog } from '../LoginForm'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/dialogs/QrCode')

export default function QrCode({
  isOpen,
  onClose,
  qrCode,
  account,
}: DialogProps) {
  const [showQrCode, setShowQrCode] = useState(true)

  const tx = useTranslationFunction()

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose}>
      <div className='qr-code-switch'>
        <p
          className={classNames({ active: showQrCode })}
          onClick={() => setShowQrCode(true)}
        >
          {tx('qrshow_title')}
        </p>
        <p
          className={classNames({ active: !showQrCode })}
          onClick={() => setShowQrCode(false)}
        >
          {tx('qrscan_title')}
        </p>
      </div>
      {showQrCode && (
        <QrCodeShowQrInner
          description={tx('qrshow_join_contact_hint', [account.addr])}
          qrCode={qrCode}
          onClose={onClose}
        />
      )}
      {!showQrCode && <QrCodeScanQrInner onClose={onClose} />}
    </DeltaDialogBase>
  )
}

export function QrCodeShowQrInner({
  qrCode,
  description,
  onClose,
  onBack,
  noPaddingTop = undefined,
}: {
  qrCode: string
  description: string
  onClose?: todo
  onBack?: todo
  noPaddingTop?: boolean
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
        <DeltaDialogContent
          noOverflow
          noPadding
          style={{ paddingTop: noPaddingTop ? '0px' : '20px' }}
        >
          <qr.QRCode
            bgColor='#FFFFFF'
            fgColor='#000000'
            level='Q'
            value={qrCode}
            style={{
              height: noPaddingTop ? 'auto' : 'calc(500px - 58px)',
              padding: '0px 20px',
              backgroundColor: 'white',
            }}
          />
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            {description}
          </p>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <DeltaDialogFooterActions style={{ justifyContent: 'space-between' }}>
          <p className={'delta-button bold primary'} onClick={onCopy}>
            {tx('global_menu_edit_copy_desktop')}
          </p>
          {onClose && (
            <p className={'delta-button bold primary'} onClick={onClose}>
              {tx('close')}
            </p>
          )}
          {onBack && (
            <p className={'delta-button bold primary'} onClick={onBack}>
              {tx('back')}
            </p>
          )}
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </>
  )
}

export function QrCodeScanQrInner({ onClose }: { onClose: () => void }) {
  const tx = window.static_translate
  const [qrCode, setQrCode] = useState('')
  const { openDialog } = useContext(ScreenContext)

  const [processingQrCode, setProcessingQrCode] = useState(false)

  const onDone = () => {
    onClose()
    setProcessingQrCode(false)
  }

  const handleScanResult = (chatId: number = null) => {
    chatId && selectChat(chatId)
    onDone()
  }

  const qrImageReader = useRef<any>()

  const handleScan = (data: string) => {
    data && !processingQrCode && processOpenQrUrl(data, handleScanResult)
  }

  const handleError = (err: string) => {
    log.error('QrReader error: ' + err)
  }

  const openImageDialog = () => {
    qrImageReader.current.openImageDialog()
  }

  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noPadding>
          <div className='import-qr-code-dialog'>
            <div style={{ marginBottom: '-19px' }}>
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
            <div className='scan-qr-red-line' />
            <p className='scan-qr-description'>{tx('qrscan_hint')}</p>
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <DeltaDialogFooterActions style={{ justifyContent: 'space-between' }}>
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
