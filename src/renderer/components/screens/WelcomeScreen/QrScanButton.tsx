import React from 'react'

import useDialog from '../../../hooks/dialog/useDialog'
import HeaderButton from '../../Dialog/HeaderButton'
import ImportQrCode from '../../dialogs/ImportQrCode'

export default function QrScanButton() {
  const { openDialog } = useDialog()

  const onClick = () => {
    openDialog(ImportQrCode)
  }

  return (
    <HeaderButton
      aria-label='Scan QR Code'
      icon='qr'
      iconSize={18}
      onClick={onClick}
    />
  )
}
