import React, { useCallback, useRef } from 'react'

import Dialog, { DialogBody, DialogFooter, FooterActions } from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import { QrReader, QrCodeScanRef } from '../QrReader'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useAlertDialog from '../../hooks/dialog/useAlertDialog'

import type { DialogProps } from '../../contexts/DialogContext'

/**
 * Basic QR code scanner
 * Just returns the scanned QR code as string
 */
export default function BasicQrScanner({
  onSuccess,
  onClose,
}: DialogProps & { onSuccess: (result: string) => void }) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()
  const qrReaderRef = useRef<QrCodeScanRef | null>(null)

  const handleError = useCallback(
    (error: any) => {
      const errorMessage = error?.message || error.toString()
      openAlertDialog({
        message: `${tx('qrscan_failed')} ${errorMessage}`,
        dataTestid: 'scan-failed',
      })
    },
    [openAlertDialog, tx]
  )

  const handleScan = useCallback(
    async (data: string) => {
      onSuccess(data)
      onClose()
    },
    [onSuccess, onClose]
  )

  const pasteClipboard = useCallback(async () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.handlePasteFromClipboard()
    }
  }, [])

  return (
    <Dialog onClose={onClose} dataTestid='basic-qrscan-dialog'>
      <DialogBody>
        <QrReader
          onScanSuccess={handleScan}
          onError={handleError}
          ref={qrReaderRef}
        />
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton onClick={pasteClipboard} data-testid='paste'>
            {tx('global_menu_edit_paste_desktop')}
          </FooterActionButton>
          <FooterActionButton onClick={onClose} data-testid='close'>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
