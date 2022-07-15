import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react'
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
import QrReader from '@deltachat/react-qr-reader'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import { getLogger } from '../../../shared/logger'
import { useContextMenu } from '../ContextMenu'
import { runtime } from '../../runtime'
import { selectChat } from '../helpers/ChatMethods'
import { BackendRemote } from '../../backend-com'

const log = getLogger('renderer/dialogs/QrCode')

export default function QrCode({
  isOpen,
  onClose,
  qrCodeSVG,
  qrCode,
}: DialogProps) {
  const [showQrCode, setShowQrCode] = useState(true)

  const [addr, setAddr] = useState('')
  useEffect(() => {
    if (window.__selectedAccountId) {
      BackendRemote.rpc
        .getConfig(window.__selectedAccountId, 'addr')
        .then(addr => setAddr(addr || ''))
    }
  }, [])

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
          description={tx('qrshow_join_contact_hint', [addr])}
          qrCode={qrCode}
          qrCodeSVG={qrCodeSVG}
          onClose={onClose}
        />
      )}
      {!showQrCode && <QrCodeScanQrInner onClose={onClose} />}
    </DeltaDialogBase>
  )
}

export function QrCodeShowQrInner({
  qrCode,
  qrCodeSVG,
  description: _description,
  onClose,
  onBack,
}: {
  qrCode: string
  qrCodeSVG?: string
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

  const [svgUrl, setSvgUrl] = useState<string | undefined>(undefined)

  useLayoutEffect(() => {
    if (qrCodeSVG) {
      try {
        const url = URL.createObjectURL(
          new Blob([qrCodeSVG], { type: 'image/svg+xml' })
        )
        setSvgUrl(url)
        return () => URL.revokeObjectURL(url)
      } catch (error) {
        setSvgUrl(undefined)
        log.error('error creating blob url for qrcode', error)
        log.info('loading svg failed, falling back to old rendering method')
        // TODO is this error handling needed?
      }
    }
  }, [qrCodeSVG])

  return (
    <>
      <DeltaDialogBody>
        <DeltaDialogContent noOverflow noPadding style={{ height: '500px' }}>
          {svgUrl && (
            <img
              style={{
                width: '100%',
                height: '100%',
                userSelect: 'none',
                paddingTop: '16px',
              }}
              src={svgUrl}
            />
          )}
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

  const handleScanResult = (chatId: number | null = null) => {
    chatId && selectChat(chatId)
    onDone()
  }

  const qrImageReader = useRef<any>()

  const handleScan = async (data: string) => {
    if (data && processingQrCode.current === false) {
      processingQrCode.current = true
      try {
        await processOpenQrUrl(data, handleScanResult)
      } catch (err) {
        processingQrCode.current = false
        throw err
      }
    } else if (processingQrCode.current === true) {
      log.debug('Already processing a qr code')
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
