const React = require('react')
const crypto = require('crypto')
const { ipcRenderer, remote } = require('electron')
const styled = require('styled-components').default

const MAGIC_PW = crypto.randomBytes(8).toString('hex')
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
      advancedSettings: {},
      userDetails: false,
      mailPw: MAGIC_PW
    }
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
    this.onBackupImport = this.onBackupImport.bind(this)
    this.onKeysExport = this.onKeysExport.bind(this)
    this.onKeysImport = this.onKeysImport.bind(this)
    this.handleSettingsChange = this.handleSettingsChange.bind(this)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
    this.handleEncryptionToggle = this.handleEncryptionToggle.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      var advancedSettings = ipcRenderer.sendSync('dispatchSync', 'getAdvancedSettings')
      advancedSettings.e2ee_enabled = !!Number(advancedSettings.e2ee_enabled)
      this.setState({ advancedSettings })
    }
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  onKeysImport () {
    var opts = {
      title: window.translate('keysImport'),
      defaultPath: remote.app.getPath('downloads'),
      properties: ['openDirectory']
    }
    remote.dialog.showOpenDialog(opts, filenames => {
      if (!filenames || !filenames.length) return
      ipcRenderer.send('dispatch', 'keysImport', filenames[0])
    })
  }

  onKeysExport () {
    // TODO: ask for the user's password and check it using
    // var matches = ipcRenderer.sendSync('dispatchSync', 'checkPassword', password)
    const tx = window.translate
    confirmationDialog(tx('keysExportConfirmationMessage'), response => {
      if (!response) return
      var opts = {
        title: window.translate('keysExport'),
        defaultPath: remote.app.getPath('downloads'),
        properties: ['openDirectory']
      }
      remote.dialog.showOpenDialog(opts, filenames => {
        if (!filenames || !filenames.length) return
        ipcRenderer.send('dispatch', 'keysExport', filenames[0])
      })
    })
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

  handleEncryptionToggle () {
    let val = 1
    if (this.state.advancedSettings.e2ee_enabled) val = 0
    ipcRenderer.sendSync('dispatchSync', 'setConfig', 'e2ee_enabled', val)
    this.setState({ advancedSettings: { e2ee_enabled: val } })
  }

  onLoginSubmit (config) {
    this.props.userFeedback(false)
    if (config.mailPw === MAGIC_PW) delete config.mailPw
    ipcRenderer.send('updateCredentials', config)
  }

  render () {
    const { deltachat, isOpen, onClose } = this.props
    const { userDetails, advancedSettings, saved, keyTransfer } = this.state

    const tx = window.translate
    const title = tx('settingsTitle')

    return (
      <div>
        <KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <Dialog
          isOpen={userDetails !== false}
          title={tx('settingsAccountTitle')}
          icon='settings'
          onClose={() => this.setState({ userDetails: false })}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsAccountTitle')}</H5>
              <Login
                {...advancedSettings}
                mailPw={this.state.mailPw}
                onSubmit={this.onLoginSubmit}
                loading={deltachat.configuring}
                addrDisabled>
                <Button type='submit' text={tx('settingsUpdateAccount')} />
                <Button type='cancel' text={tx('login.cancel')} />
              </Login>
            </Card>
          </SettingsDialog>
        </Dialog>
        <Dialog
          isOpen={isOpen && !keyTransfer && !userDetails}
          title={title}
          icon='settings'
          onClose={onClose}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <H5>{deltachat.credentials.addr}</H5>
              <Button onClick={() => this.setState({ userDetails: true })}>
                {tx('settingsAccountTitle')}
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsAutocryptSection')}</H5>
              <p>{tx('autocryptDescription')}</p>
              <Switch
                checked={advancedSettings.e2ee_enabled}
                label={tx('settingsEndToEndSetup')}
                onChange={this.handleEncryptionToggle}
              />
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
              <H5>{tx('settingsManageKeys')}</H5>
              <ButtonGroup>
                <Button onClick={this.onKeysExport}>{tx('keysExport')}...</Button>
                <Button onClick={this.onKeysImport}>{tx('keysImport')}...</Button>
              </ButtonGroup>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('settingsOptionsSection')}</H5>
              <Switch
                checked={saved && saved.markRead}
                label={tx('settingsMarkRead')}
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
