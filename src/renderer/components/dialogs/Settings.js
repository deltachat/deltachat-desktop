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
  Switch,
  Callout
} = require('@blueprintjs/core')

const Login = require('../Login')
const KeyTransfer = require('./KeyTransfer')
const confirmationDialog = require('./confirmationDialog')

const SettingsDialog = styled.div`
  .bp3-card:not(:last-child){
    margin-bottom: 20px;
  }
`

function flipDeltaBoolean (value) {
  return value === '1' ? '0' : '1'
}

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      keyTransfer: false,
      saved: props.saved,
      advancedSettings: {},
      userDetails: false,
      mailPw: MAGIC_PW,
      settings: {}
    }
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
    this.onBackupImport = this.onBackupImport.bind(this)
    this.handleSettingsChange = this.handleSettingsChange.bind(this)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const settings = ipcRenderer.sendSync(
        'dispatchSync',
        'getConfigFor', [
          'inbox_watch',
          'sentbox_watch',
          'mvbox_watch',
          'mvbox_move',
          'e2ee_enabled'
        ]
      )
      this.setState({ settings })
    }
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  onBackupImport () {
    const tx = window.translate
    const opts = {
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }]
    }
    remote.dialog.showOpenDialog(opts, filenames => {
      if (!filenames || !filenames.length) return
      ipcRenderer.send('backupImport', filenames[0])
    })
  }

  onBackupExport () {
    const tx = window.translate
    var confirmOpts = {
      buttons: [tx('cancel'), tx('export_backup_desktop')]
    }
    confirmationDialog(tx('pref_backup_export_explain'), confirmOpts, response => {
      if (!response) return
      var opts = {
        title: tx('export_backup_desktop'),
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
    const { saved } = this.state
    saved[key] = value
    this.setState({ saved })
    ipcRenderer.send('updateSettings', saved)
  }

  handleDeltaSettingsChange (key, value) {
    ipcRenderer.sendSync('dispatchSync', 'setConfig', key, value)
    const settings = this.state.settings
    settings[key] = String(value)
    this.setState({ settings })
  }

  onLoginSubmit (config) {
    this.props.userFeedback(false)
    if (config.mailPw === MAGIC_PW) delete config.mailPw
    ipcRenderer.send('updateCredentials', config)
  }

  renderSwitch (configKey, label) {
    let configValue = this.state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        label={label}
        onChange={() => this.handleDeltaSettingsChange(configKey, flipDeltaBoolean(configValue))}
      />
    )
  }

  render () {
    const { deltachat, isOpen, onClose } = this.props
    const { userDetails, advancedSettings, saved, keyTransfer } = this.state

    const tx = window.translate
    const title = tx('menu_settings')

    return (
      <div>
        <KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <Dialog
          isOpen={userDetails !== false}
          title={tx('pref_password_and_account_settings')}
          icon='settings'
          onClose={() => this.setState({ userDetails: false })}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <Login
                {...advancedSettings}
                mailPw={this.state.mailPw}
                onSubmit={this.onLoginSubmit}
                loading={deltachat.configuring}
                addrDisabled>
                <Button type='submit' text={tx('login_title')} />
                <Button type='cancel' text={tx('cancel')} />
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
                {tx('pref_password_and_account_settings')}
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('autocrypt')}</H5>
              <Callout>{tx('autocrypt_explain')}</Callout>
              <br />
              { this.renderSwitch('e2ee_enabled', tx('autocrypt_prefer_e2ee'))}
              <Button onClick={this.initiateKeyTransfer}>
                {tx('autocrypt_send_asm_button')}
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('pref_backup')}</H5>
              <ButtonGroup>
                <Button onClick={this.onBackupExport}>{tx('pref_backup_export_start_button')}</Button>
                <Button onClick={this.onBackupImport}>{tx('import_backup_title')}</Button>
              </ButtonGroup>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('pref_privacy')}</H5>
              <Switch
                checked={saved && saved.markRead}
                label={tx('pref_read_receipts')}
                onChange={() => this.handleSettingsChange('markRead', !this.state.saved.markRead)}
              />
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('pref_imap_folder_handling')}</H5>
              { this.renderSwitch('inbox_watch', tx('pref_watch_inbox_folder')) }
              { this.renderSwitch('sentbox_watch', tx('pref_watch_sent_folder')) }
              { this.renderSwitch('mvbox_watch', tx('pref_watch_mvbox_folder')) }
              { this.renderSwitch('mvbox_move', tx('pref_auto_folder_moves')) }
            </Card>
          </SettingsDialog>
        </Dialog>
      </div>
    )
  }
}

module.exports = Settings
