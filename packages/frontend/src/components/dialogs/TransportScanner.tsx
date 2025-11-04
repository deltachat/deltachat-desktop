import React, { useCallback, useRef } from 'react'

import Dialog, { DialogBody, DialogFooter, FooterActions } from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import { QrReader, QrCodeScanRef } from '../QrReader'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { processQr } from '../../backend/qr'
import useAlertDialog from '../../hooks/dialog/useAlertDialog'
import { selectedAccountId } from '../../ScreenController'

import type { DialogProps } from '../../contexts/DialogContext'

/**
 * QR code scanner for transport configuration
 * Processes scanned QR code and calls onSuccess if it is a valid transport QR code
 * copied from dialogs/QrCode.tsx
 */
export default function TransportQrScanner({
  onSuccess,
  onClose,
}: DialogProps & { onSuccess: (result: string) => void }) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const openAlertDialog = useAlertDialog()
  const qrReaderRef = useRef<QrCodeScanRef | null>(null)

  const handleError = useCallback(
    (error: any) => {
      const errorMessage = error?.message || error.toString()
      openAlertDialog({
        message: `${tx('qrscan_failed')} ${errorMessage}`,
        dataTestid: 'transport-scan-failed',
      })
    },
    [openAlertDialog, tx]
  )

  const handleScan = useCallback(
    async (data: string) => {
      if (data) {
        const { qr } = await processQr(accountId, data)
        if (qr.kind === 'account') {
          onSuccess(data)
          onClose()
        } else {
          handleError(new Error('Invalid transport QR code'))
        }
      }
    },
    [onSuccess, onClose, accountId, handleError]
  )

  const pasteClipboard = useCallback(async () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.handlePasteFromClipboard()
    }
  }, [])

  return (
    <Dialog onClose={onClose} dataTestid='transport-qrscan-dialog'>
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
