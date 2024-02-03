import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react'
import classNames from 'classnames'
import QrReader from '@deltachat/react-qr-reader'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import { BackendRemote } from '../../backend-com'
import { getLogger } from '../../../shared/logger'
import { runtime } from '../../runtime'
import { selectChat } from '../helpers/ChatMethods'
import { ScreenContext } from '../../contexts/ScreenContext'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'
import useContextMenu from '../../hooks/useContextMenu'
import { qrCodeToInviteUrl } from '../../utils/invite'

import type { DialogProps } from '../../contexts/DialogContext'

const log = getLogger('renderer/dialogs/QrCode')

type Props = {
  selectScan?: true
  qrCodeSVG: string
  qrCode: string
}

export default function QrCode({
  qrCodeSVG,
  qrCode,
  selectScan,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()
  const [showQrCode, setShowQrCode] = useState(!selectScan)
  const [addr, setAddr] = useState('')

  useEffect(() => {
    if (window.__selectedAccountId) {
      BackendRemote.rpc
        .getConfig(window.__selectedAccountId, 'addr')
        .then(addr => setAddr(addr || ''))
    }
  }, [])

  return (
    <Dialog onClose={onClose}>
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
      {!showQrCode && (
        <QrCodeScanQrInner subtitle={tx('qrscan_hint')} onClose={onClose} />
      )}
    </Dialog>
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
    const inviteUrl = qrCodeToInviteUrl(qrCode)

    runtime.writeClipboardText(inviteUrl).then(_ =>
      userFeedback({
        type: 'success',
        text: tx('copy_qr_data_success'),
      })
    )
  }

  const [svgUrl, setSvgUrl] = useState<string | undefined>(undefined)
  const svgUrlRef = useRef(svgUrl)

  useLayoutEffect(() => {
    if (qrCodeSVG) {
      try {
        const url = URL.createObjectURL(
          new Blob([qrCodeSVG], { type: 'image/svg+xml' })
        )
        setSvgUrl(url)
        svgUrlRef.current = url
        return () => URL.revokeObjectURL(url)
      } catch (error) {
        setSvgUrl(undefined)
        log.error('error creating blob url for qrcode', error)
        log.info('loading svg failed, falling back to old rendering method')
        // TODO is this error handling needed?
      }
    }
  }, [qrCodeSVG])

  const imageContextMenu = useContextMenu([
    {
      label: tx('menu_copy_image_to_clipboard'),
      action: async () => {
        if (svgUrlRef.current) {
          const img = document.createElement('img')
          img.src = svgUrlRef.current
          // wait for image to load
          await new Promise(resolve => {
            img.onload = resolve
          })
          const canvas = document.createElement('canvas')
          canvas.height = 630
          canvas.width = 515
          const context = canvas.getContext('2d')
          context?.drawImage(img, 0, 0)
          canvas.toBlob(function (blob) {
            if (blob) {
              const item = new ClipboardItem({ 'image/png': blob })
              navigator.clipboard.write([item])
            }
          }, 'image/png')
        }
      },
    },
  ])

  return (
    <>
      <DialogBody>
        <DialogContent>
          {svgUrl && (
            <img
              style={{
                width: '100%',
                height: '100%',
                userSelect: 'none',
                paddingTop: '16px',
              }}
              src={svgUrl}
              onContextMenu={imageContextMenu}
            />
          )}
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align={!onClose && !onBack ? 'center' : 'spaceBetween'}>
          <FooterActionButton onClick={onCopy}>
            {tx('global_menu_edit_copy_desktop')}
          </FooterActionButton>
          {onClose && (
            <FooterActionButton onClick={onClose}>
              {tx('close')}
            </FooterActionButton>
          )}
          {onBack && (
            <FooterActionButton onClick={onBack}>
              {tx('back')}
            </FooterActionButton>
          )}
        </FooterActions>
      </DialogFooter>
    </>
  )
}

export function QrCodeScanQrInner(
  props: React.PropsWithChildren<{
    subtitle: string
    onClose: () => void
  }>
) {
  const tx = useTranslationFunction()
  const { openDialog, closeDialog } = useDialog()
  const processingQrCode = useRef(false)

  const onDone = () => {
    props.onClose()
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
        await processOpenQrUrl(openDialog, closeDialog, data, handleScanResult)
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
      <DialogBody>
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
          <p className='scan-qr-description'>{props.subtitle}</p>
        </div>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton onClick={openMenu}>
            {tx('menu_more_options')}
          </FooterActionButton>
          <FooterActionButton onClick={props.onClose}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}
