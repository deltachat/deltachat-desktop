const React = require('react')
const crypto = require('crypto')
const { ipcRenderer, remote } = require('electron')
const styled = require('styled-components').default
const C = require('deltachat-node/constants')

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
  Label,
  RadioGroup,
  Radio,
  Callout
} = require('@blueprintjs/core')

const Login = require('../Login').default
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
      mail_pw: MAGIC_PW,
      settings: {}
    }
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
    this.onBackupImport = this.onBackupImport.bind(this)
    this.onKeysExport = this.onKeysExport.bind(this)
    this.onKeysImport = this.onKeysImport.bind(this)
    this.handleRCSettingsChange = this.handleRCSettingsChange.bind(this)
    this.handleDeltaSettingsChange = this.handleDeltaSettingsChange.bind(this)
    this.renderRCSwitch = this.renderRCSwitch.bind(this)
    this.renderDeltaSwitch = this.renderDeltaSwitch.bind(this)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
    this.translate = window.translate
  }

  componentDidUpdate (prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const settings = ipcRenderer.sendSync(
        'getConfigFor', [
          'addr',
          'mail_pw',
          'inbox_watch',
          'sentbox_watch',
          'mvbox_watch',
          'mvbox_move',
          'e2ee_enabled',
          'configured_mail_server',
          'configured_mail_user',
          'configured_mail_port',
          'configured_mail_security',
          'configured_send_user',
          'configured_send_pw',
          'configured_send_server',
          'configured_send_port',
          'configured_send_security',
          'configured_e2ee_enabled',
          'displayname',
          'selfstatus',
          // 'mdns_enabled', // TODO - investigate markRead var doesn't affect this?
          'show_emails'
        ]
      )

      const advancedSettings = {
        mailUser: settings['configured_mail_user'],
        mailServer: settings['configured_mail_server'],
        mailPort: settings['configured_mail_port'],
        mailSecurity: settings['configured_mail_security'],
        sendUser: settings['configured_send_user'],
        sendPw: settings['configured_send_pw'],
        sendServer: settings['configured_send_server'],
        sendPort: settings['configured_send_port'],
        sendSecurity: settings['configured_send_security'],
        e2ee_enabled: settings['configured_e2ee_enabled']
      }

      this.setState({ settings, advancedSettings })
    }
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  onKeysImport () {
    const opts = {
      title: window.translate('pref_managekeys_import_explain'),
      defaultPath: remote.app.getPath('downloads'),
      properties: ['openDirectory']
    }
    remote.dialog.showOpenDialog(
      opts,
      filenames => {
        if (filenames && filenames.length) {
          confirmationDialog(window.translate('pref_managekeys_import_explain', filenames[0]), response => {
            if (!response) {
              return
            }
            ipcRenderer.on('DC_EVENT_IMEX_PROGRESS', (_event, progress) => {
              if (progress === 1000) {
                this.props.userFeedback({ type: 'success', text: this.translate('pref_managekeys_secret_keys_imported_from_x', filenames[0]) })
              }
            })
            return ipcRenderer.send('keysImport', filenames[0])
          })
        }
      }
    )
  }

  onKeysExport () {
    // TODO: ask for the user's password and check it using
    // var matches = ipcRenderer.sendSync('dispatchSync', 'checkPassword', password)

    const opts = {
      title: window.translate('pref_managekeys_export_secret_keys'),
      defaultPath: remote.app.getPath('downloads'),
      properties: ['openDirectory']
    }

    remote.dialog.showOpenDialog(opts, filenames => {
      if (filenames && filenames.length) {
        confirmationDialog(this.translate('pref_managekeys_export_explain').replace('%1$s', filenames[0]), response => {
          if (!response) return
          if (filenames && filenames.length) {
            ipcRenderer.once('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
              this.props.userFeedback({ type: 'success', text: this.translate('pref_managekeys_secret_keys_exported_to_x', filename) })
            })
            ipcRenderer.send('keysExport', filenames[0])
          }
        })
      }
    })
  }

  onBackupImport () {
    const opts = {
      title: this.translate('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }]
    }
    remote.dialog.showOpenDialog(opts, filenames => {
      if (!filenames || !filenames.length) return
      ipcRenderer.send('backupImport', filenames[0])
    })
  }

  onBackupExport () {
    let confirmOpts = {
      buttons: [this.translate('cancel'), this.translate('export_backup_desktop')]
    }
    confirmationDialog(this.translate('pref_backup_export_explain'), confirmOpts, response => {
      if (!response) return
      let opts = {
        title: this.translate('export_backup_desktop'),
        defaultPath: remote.app.getPath('downloads'),
        properties: ['openDirectory']
      }
      remote.dialog.showOpenDialog(opts, filenames => {
        if (!filenames || !filenames.length) {
          return
        }
        ipcRenderer.once('DC_EVENT_IMEX_FILE_WRITTEN', (_event, filename) => {
          this.props.userFeedback({ type: 'success', text: this.translate('pref_backup_written_to_x', filename) })
        })
        ipcRenderer.send('backupExport', filenames[0])
      })
    })
  }

  initiateKeyTransfer () {
    this.setState({ keyTransfer: true })
  }

  /** Saves settings for the application (saved in ~/.config/DeltaChat/deltachat.json) */
  handleRCSettingsChange (key, value) {
    const { saved } = this.state
    saved[key] = value
    this.setState({ saved })
    ipcRenderer.send('updateSettings', saved)
  }

  /** Saves settings to deltachat core */
  handleDeltaSettingsChange (key, value) {
    ipcRenderer.sendSync('setConfig', key, value)
    const settings = this.state.settings
    settings[key] = String(value)
    this.setState({ settings })
  }

  onLoginSubmit (config) {
    this.props.userFeedback(false)
    if (config.mail_pw === MAGIC_PW) delete config.mail_pw
    ipcRenderer.send('updateCredentials', config)
  }

  renderRCSwitch (configKey, label) {
    const { saved } = this.state
    return (
      <Switch
        checked={saved && saved[configKey]}
        label={label}
        onChange={() => this.handleRCSettingsChange(configKey, !saved[configKey])}
      />
    )
  }

  renderDeltaSwitch (configKey, label) {
    let configValue = this.state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        label={label}
        onChange={() => this.handleDeltaSettingsChange(configKey, flipDeltaBoolean(configValue))}
      />
    )
  }

  renderDeltaInput (configKey, label) {
    let configValue = this.state.settings[configKey]
    return (
      <Label>
        {label}
        <input
          value={configValue}
          className={Classes.INPUT}
          onChange={(ev) => this.handleDeltaSettingsChange(configKey, ev.target.value)}
        />
      </Label>
    )
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListener('DC_EVENT_IMEX_FILE_WRITTEN')
  }

  render () {
    const { deltachat, isOpen, onClose } = this.props
    const { userDetails, settings, advancedSettings, keyTransfer } = this.state
    const title = this.translate('menu_settings')

    return (
      <div>
        <KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <Dialog
          isOpen={userDetails !== false}
          title={this.translate('pref_password_and_account_settings')}
          icon='settings'
          onClose={() => this.setState({ userDetails: false })}>
          <SettingsDialog className={Classes.DIALOG_BODY}>
            <Card elevation={Elevation.ONE}>
              <Login
                {...advancedSettings}
                mode={'update'}
                addr={settings.addr}
                mail_pw={settings.mail_pw}
                onSubmit={this.onLoginSubmit}
                loading={deltachat.configuring}
                addrDisabled>
                <Button type='submit' text={userDetails ? this.translate('update') : this.translate('login_title')} />
                <Button type='cancel' text={this.translate('cancel')} />
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
                {this.translate('pref_password_and_account_settings')}
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_chats_and_media')}</H5>
              <Callout>{this.translate('pref_enter_sends_explain')}</Callout>
              <br />
              { this.renderRCSwitch('enterKeySends', this.translate('pref_enter_sends')) }
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('autocrypt')}</H5>
              <Callout>{this.translate('autocrypt_explain')}</Callout>
              <br />
              { this.renderDeltaSwitch('e2ee_enabled', this.translate('autocrypt_prefer_e2ee'))}
              <Button onClick={this.initiateKeyTransfer}>
                {this.translate('autocrypt_send_asm_button')}
              </Button>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_backup')}</H5>
              <ButtonGroup>
                <Button onClick={this.onBackupExport}>{this.translate('pref_backup_export_start_button')}</Button>
                <Button onClick={this.onBackupImport}>{this.translate('import_backup_title')}</Button>
              </ButtonGroup>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_managekeys_menu_title')}</H5>
              <ButtonGroup>
                <Button onClick={this.onKeysExport}>{this.translate('pref_managekeys_export_secret_keys')}...</Button>
                <Button onClick={this.onKeysImport}>{this.translate('pref_managekeys_import_secret_keys')}...</Button>
              </ButtonGroup>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_privacy')}</H5>
              { this.renderRCSwitch('markRead', this.translate('pref_read_receipts')) }
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_imap_folder_handling')}</H5>
              { this.renderDeltaSwitch('inbox_watch', this.translate('pref_watch_inbox_folder')) }
              { this.renderDeltaSwitch('sentbox_watch', this.translate('pref_watch_sent_folder')) }
              { this.renderDeltaSwitch('mvbox_watch', this.translate('pref_watch_mvbox_folder')) }
              { this.renderDeltaSwitch('mvbox_move', this.translate('pref_auto_folder_moves')) }
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_profile_info_headline')}</H5>
              { this.renderDeltaInput('displayname', this.translate('pref_your_name'))}
              { this.renderDeltaInput('selfstatus', this.translate('pref_default_status_label'))}
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_email_interaction_title')}</H5>
              <RadioGroup
                label={this.translate('pref_show_emails')}
                onChange={(ev) => this.handleDeltaSettingsChange('show_emails', ev.target.value)}
                selectedValue={Number(settings['show_emails'])}
              >
                <Radio label={this.translate('pref_show_emails_no')} value={C.DC_SHOW_EMAILS_OFF} />
                <Radio label={this.translate('pref_show_emails_accepted_contacts')} value={C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS} />
                <Radio label={this.translate('pref_show_emails_all')} value={C.DC_SHOW_EMAILS_ALL} />
              </RadioGroup>
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{this.translate('pref_experimental_features')}</H5>
              { this.renderRCSwitch('enableOnDemandLocationStreaming', this.translate('pref_on_demand_location_streaming')) }
            </Card>
          </SettingsDialog>
        </Dialog>
      </div>
    )
  }
}

module.exports = Settings
