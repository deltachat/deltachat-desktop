import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react'
import classNames from 'classnames'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import QrReader from '../QrReader'
import { BackendRemote } from '../../backend-com'
import { getLogger } from '../../../../shared/logger'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { ScreenContext } from '../../contexts/ScreenContext'
import useContextMenu from '../../hooks/useContextMenu'
import useProcessQr from '../../hooks/useProcessQr'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { qrCodeToInviteUrl } from '../../utils/invite'
import { selectedAccountId } from '../../ScreenController'

import type { DialogProps } from '../../contexts/DialogContext'
import useAlertDialog from '../../hooks/dialog/useAlertDialog'

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
    <Dialog onClose={onClose} dataTestid='qr-dialog'>
      <div className='qr-code-switch'>
        <button
          className={classNames({ active: showQrCode })}
          onClick={() => setShowQrCode(true)}
          data-testid='qr-show'
        >
          {tx('qrshow_title')}
        </button>
        <button
          className={classNames({ active: !showQrCode })}
          onClick={() => setShowQrCode(false)}
          data-testid='show-qr-scan'
        >
          {tx('qrscan_title')}
        </button>
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
              tabIndex={0}
            />
          )}
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align={!onClose && !onBack ? 'center' : 'spaceBetween'}>
          <FooterActionButton data-testid='copy-qr-code' onClick={onCopy}>
            {tx('global_menu_edit_copy_desktop')}
          </FooterActionButton>
          {onClose && (
            <FooterActionButton onClick={onClose} data-testid='close'>
              {tx('close')}
            </FooterActionButton>
          )}
          {onBack && (
            <FooterActionButton onClick={onBack} data-testid='back'>
              {tx('back')}
            </FooterActionButton>
          )}
        </FooterActions>
      </DialogFooter>
    </>
  )
}

export function QrCodeScanQrInner({
  onClose,
}: React.PropsWithChildren<{
  onClose: () => void
}>) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const processQr = useProcessQr()
  const processingQrCode = useRef(false)
  const openAlertDialog = useAlertDialog()

  const onDone = useCallback(() => {
    onClose()
    processingQrCode.current = false
  }, [onClose])

  const handleScan = useCallback(
    async (data: string) => {
      if (data && !processingQrCode.current) {
        processingQrCode.current = true
        try {
          await processQr(accountId, data, onDone)
        } catch (error: any) {
          log.errorWithoutStackTrace('QrReader process error: ', error)
          openAlertDialog({
            message: error.message || error.toString(),
          })
        }
        processingQrCode.current = false
      } else if (processingQrCode.current === true) {
        log.debug('Already processing a qr code')
      }
    },
    [accountId, processQr, onDone, openAlertDialog]
  )

  const handleError = (err: string) => {
    log.error('QrReader error: ' + err)
  }

  return (
    <>
      <DialogBody>
        <QrReader onScan={handleScan} onError={handleError} />
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClose} data-testid='close'>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}
