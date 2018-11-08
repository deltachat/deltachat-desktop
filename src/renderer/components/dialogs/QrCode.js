const React = require('react')
const { Classes, Dialog } = require('@blueprintjs/core')
const { QRCode } = require('react-qr-svg')

class QrCodeDialog extends React.Component {
  render () {
    const { qrCode, onClose } = this.props
    const isOpen = !!qrCode
    const tx = window.translate

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('qrCode')}
        icon='barcode'
        onClose={onClose}
        style={{ width: 296 }}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <QRCode
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="Q"
            style={{ width: 256 }}
            value={qrCode}
          />
        </div>
      </Dialog>
    )
  }
}

module.exports = QrCodeDialog
