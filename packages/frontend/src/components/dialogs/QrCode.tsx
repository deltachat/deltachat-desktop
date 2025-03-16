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
import { qrCodeFromClipboard } from '../QrReader/helper'

import { BackendRemote } from '../../backend-com'
import { getLogger } from '../../../../shared/logger'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { ScreenContext } from '../../contexts/ScreenContext'
import useContextMenu from '../../hooks/useContextMenu'
import useProcessQr from '../../hooks/useProcessQr'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../ScreenController'

import useDialog from '../../hooks/dialog/useDialog'
import type { DialogProps } from '../../contexts/DialogContext'
import useAlertDialog from '../../hooks/dialog/useAlertDialog'
import QrCodeCopyConfirmationDialog from './QrCodeCopyConfirmationDialog'

const log = getLogger('renderer/dialogs/QrCode')

type Props = {
  selectScan?: true
  qrCodeSVG: string
  qrCode: string
}

/**
 * dialog to show a qr code and scan a qr code
 */
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
  const { openDialog } = useDialog()

  const onCopy = () => {
    // Pop up confirmation dialog when clicked instead of copying the link directly
    openDialog(QrCodeCopyConfirmationDialog, {
      message: tx('share_invite_link_explain'),
      content: qrCode,
      copyCb: () => {
        userFeedback({
          type: 'success',
          text: tx('copy_qr_data_success'),
        })
        onClose()
      },
      // no cancelCb; skip closing the window, maybe the user wants to use the QR code after all
    })
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
      <DialogBody className='show-qr-dialog-body'>
        <DialogContent className='show-qr-dialog-content'>
          {svgUrl && (
            <img
              style={{
                width: '100%',
                height: '100%',
                userSelect: 'none',
                paddingTop: '16px',
              }}
              className='show-qr-dialog-qr-image'
              src={svgUrl}
              onContextMenu={imageContextMenu}
              tabIndex={0}
            />
          )}
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align={!onClose && !onBack ? 'center' : 'spaceBetween'}>
          <FooterActionButton
            styling='secondary'
            data-testid='copy-qr-code'
            onClick={onCopy}
          >
            <div className='copy-link-icon'></div>
            {tx('menu_copy_link_to_clipboard')}
          </FooterActionButton>
          {onClose && (
            <FooterActionButton
              styling='secondary'
              onClick={onClose}
              data-testid='close'
            >
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

  const handleError = useCallback(
    (error: any) => {
      const errorMessage = error?.message || error.toString()
      openAlertDialog({
        message: `${tx('qrscan_failed')} ${errorMessage}`,
      })
    },
    [openAlertDialog, tx]
  )
  const handleScan = useCallback(
    async (data: string) => {
      if (data && !processingQrCode.current) {
        processingQrCode.current = true
        try {
          await processQr(accountId, data, onDone)
        } catch (error: any) {
          log.errorWithoutStackTrace('QrReader process error: ', error)
          handleError(error)
        }
        processingQrCode.current = false
      } else if (processingQrCode.current === true) {
        log.debug('Already processing a qr code')
      }
    },
    [accountId, processQr, onDone, handleError]
  )

  const pasteClipboard = useCallback(async () => {
    try {
      const result = await qrCodeFromClipboard(runtime)
      handleScan(result)
    } catch (error: any) {
      if (typeof error === 'string') {
        handleError(error)
      } else {
        handleError(error.toString())
      }
    }
  }, [handleError, handleScan])

  return (
    <>
      <DialogBody>
        <QrReader onScanSuccess={handleScan} onError={handleError} />
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton
            styling='secondary'
            onClick={pasteClipboard}
            data-testid='paste'
          >
            {tx('global_menu_edit_paste_desktop')}
          </FooterActionButton>
          <FooterActionButton
            styling='secondary'
            onClick={onClose}
            data-testid='close'
          >
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}
