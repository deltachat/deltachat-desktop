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
  Dialog,
  Switch
} = require('@blueprintjs/core')

const Login = require('../Login')
const KeyTransfer = require('./KeyTransfer')
const confirmationDialog = require('./confirmationDialog')
const State = require('../../lib/state')

const SettingsDialog = styled.div`
  .bp3-card:not(:last-child){
    margin-bottom: 20px;
  }
`

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      keyTransfer: false,
      saved: props.saved,
      advancedSettings: false
    }
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
    this.onBackupImport = this.onBackupImport.bind(this)
    this.handleSettingsChange = this.handleSettingsChange.bind(this)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
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
    confirmationDialog(tx('backupConfirmationMessage'), confirmOpts, response => {
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

  handleSettingsChange (key, value) {
    this.state.saved[key] = value
    this.setState({ saved: this.state.saved })
    State.save({ saved: this.state.saved })
    ipcRenderer.send('updateSettings', this.state.saved)
  }

  onLoginSubmit (event) {
    console.log('what do we do here??')
    // TODO: this should happen after whatever we did seems to be fine.
    this.props.userFeedback({ type: 'success', text: 'Account updated successfully' })
  }

  render () {
    const { deltachat, isOpen, onClose } = this.props
    const { advancedSettings, saved, keyTransfer } = this.state

    const tx = window.translate
    const title = tx('settingsTitle')

    return (
      <div>
        <KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <Dialog
          isOpen={advancedSettings}
          title={tx('settingsAdvancedTitle')}
          icon='settings'
          onClose={() => this.setState({ advancedSettings: false })}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsAccountTitle')}</H5>
              <Login
                addr={deltachat.credentials.addr}
                onSubmit={this.onLoginSubmit}
                loading={deltachat.configuring}>
                <Button type='submit' text={tx('settingsUpdateAccount')} />
                <Button type='cancel' text={tx('login.cancel')} />
              </Login>
            </Card>
          </SettingsDialog>
        </Dialog>
        <Dialog
          isOpen={isOpen && !keyTransfer && !advancedSettings}
          title={title}
          icon='settings'
          onClose={onClose}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <H5>{deltachat.credentials.addr}</H5>
              <Button onClick={() => this.setState({ advancedSettings: true })}>
                Account Settings
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsAutocryptSection')}</H5>
              <p>{tx('autocryptDescription')}</p>
              <Button onClick={this.initiateKeyTransfer}>
                {tx('initiateKeyTransferTitle')}
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsBackupSection')}</H5>
              <ButtonGroup>
                <Button onClick={this.onBackupExport}>{tx('exportBackup')}...</Button>
                <Button onClick={this.onBackupImport}>{tx('importBackup')}...</Button>
              </ButtonGroup>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsOptionsSection')}</H5>
              <Switch
                checked={saved.markRead}
                label='Mark incoming messages as read'
                onChange={() => this.handleSettingsChange('markRead', !this.state.saved.markRead)}
              />
            </Card>
          </SettingsDialog>
        </Dialog>
      </div>
    )
  }
}

module.exports = Settings
