import React, { useState, useContext, useRef } from 'react'
import {
  DeltaDialogBase,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogBody,
  DeltaDialogContent,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import classNames from 'classnames'
import qr from 'react-qr-svg'
import QrReader from 'react-qr-reader'
import { selectChat } from '../../stores/chat'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import { getLogger } from '../../../shared/logger'
import { useContextMenu } from '../ContextMenu'
import { runtime } from '../../runtime'

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
}: {
  qrCode: string
  description: string
  onClose?: todo
  onBack?: todo
}) {
  const { userFeedback } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  const onCopy = () => {
    runtime.writeClipboardText(qrCode).then(_ =>
      userFeedback({
        type: 'success',
        text: tx('copy_qr_data_success'),
      })
    )
  }

  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noOverflow noPadding style={{ height: '500px' }}>
          <qr.QRCode
            bgColor='#FFFFFF'
            fgColor='#000000'
            level='Q'
            value={qrCode}
            style={{
              height: 'auto',
              padding: '30px',
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

  const processingQrCode = useRef(false)

  const onDone = () => {
    onClose()
    processingQrCode.current = false
  }

  const handleScanResult = (chatId: number = null) => {
    chatId && selectChat(chatId)
    onDone()
  }

  const qrImageReader = useRef<any>()

  const handleScan = (data: string) => {
    if (data && processingQrCode.current === false) {
      processingQrCode.current = true
      processOpenQrUrl(data, handleScanResult)
    }
  }

  const handleError = (err: string) => {
    log.error('QrReader error: ' + err)
  }

  const openImageDialog = () => {
    qrImageReader.current.openImageDialog()
  }

  const { userFeedback } = useContext(ScreenContext)

  const openMenu = useContextMenu([
    {
      label: tx('load_qr_code_as_image'),
      action: openImageDialog,
    },
    {
      label: tx('paste_from_clipboard'),
      action: async () => {
        try {
          const data = await runtime.readClipboardText()
          if (data) {
            handleScan(data)
          } else {
            throw 'not data in clipboard'
          }
        } catch (error) {
          log.error('Reading qrcodedata from clipboard failed: ', error)
          userFeedback({
            type: 'error',
            text: 'Reading qrcodedata from clipboard failed: ' + error,
          })
        }
      },
    },
  ])

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
          <p className={'delta-button bold primary'} onClick={openMenu}>
            {tx('menu_more_options')}
          </p>
          <p className={'delta-button bold primary'} onClick={onClose}>
            {tx('close')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </>
  )
}
