const React = require('react')
const { ipcRenderer, remote } = require('electron')
const styled = require('styled-components').default

const {
  Elevation,
  H5,
  Card,
  ButtonGroup,
  Classes,
  Button,
  Dialog
} = require('@blueprintjs/core')

const dialogs = require('./dialogs')

const SettingsDialog = styled.div`
  .bp3-card:not(:last-child){
    margin-bottom: 20px;
  }
`

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      keyTransfer: false
    }
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
    this.onBackupImport = this.onBackupImport.bind(this)
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  onBackupImport () {
    const tx = window.translate
    var opts = {
      title: tx('importBackup'),
      properties: ['openFile'],
      filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }]
    }
    remote.dialog.showOpenDialog(opts, filenames => {
      if (!filenames || !filenames.length) return
      ipcRenderer.send('dispatch', 'backupImport', filenames[0])
    })
  }

  onBackupExport () {
    const tx = window.translate
    var confirmOpts = {
      buttons: [tx('cancel'), tx('exportBackup')]
    }
    dialogs.confirmation(tx('backupConfirmationMessage'), confirmOpts, response => {
      if (!response) return
      var opts = {
        title: tx('exportBackup'),
        defaultPath: remote.app.getPath('downloads'),
        properties: ['openDirectory']
      }
      remote.dialog.showOpenDialog(opts, filenames => {
        if (!filenames || !filenames.length) return
        ipcRenderer.send('dispatch', 'backupExport', filenames[0])
      })
    })
  }

  initiateKeyTransfer () {
    this.setState({ keyTransfer: true })
  }

  render () {
    const { isOpen, onClose } = this.props
    const { keyTransfer } = this.state

    const tx = window.translate
    const title = tx('settingsTitle')

    return (
      <div>
        <dialogs.KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <Dialog
          isOpen={isOpen}
          title={title}
          icon='info-sign'
          onClose={onClose}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsAutocryptSection')}</H5>
              <p>{tx('autocryptDescription')}</p>
              <Button onClick={this.initiateKeyTransfer}>{tx('initiateKeyTransferTitle')}</Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsBackupSection')}</H5>
              <ButtonGroup>
                <Button onClick={this.onBackupExport}>{tx('exportBackup')}...</Button>
                <Button onClick={this.onBackupImport}>{tx('importBackup')}...</Button>
              </ButtonGroup>
            </Card>
          </SettingsDialog>
        </Dialog>
      </div>
    )
  }
}

module.exports = Settings
