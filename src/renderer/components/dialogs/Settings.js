import React from 'react'
import crypto from 'crypto'
import { ipcRenderer, remote } from 'electron'
import C from 'deltachat-node/constants'
import { createGlobalStyle } from 'styled-components'
import {
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
} from '@blueprintjs/core'

import Login from '../Login'
import SendAutocryptSetupMessage from './SendAutocryptSetupMessage'
import { confirmationDialogLegacy as confirmationDialog } from './confirmationDialog'
const MAGIC_PW = crypto.randomBytes(8).toString('hex')

function flipDeltaBoolean (value) {
  return value === '1' ? '0' : '1'
}

const SettingsDialogGlobal = createGlobalStyle`
    .SettingsDialog {
        position: absolute;
        top: 0;
    }
`

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      keyTransfer: false,
      saved: props.saved,
      advancedSettings: {},
      userDetails: false,
      mail_pw: MAGIC_PW,
      settings: {},
      show: 'main'
    }
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
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
          'mdns_enabled',
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

  onBackupExport () {
    const { openDialog, closeDialog } = this.props
    const confirmOpts = {
      buttons: [this.translate('cancel'), this.translate('export_backup_desktop')]
    }
    confirmationDialog(this.translate('pref_backup_export_explain'), confirmOpts, response => {
      if (!response) return
      const opts = {
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

          closeDialog('ImexProgress')
        })
        ipcRenderer.send('backupExport', filenames[0])
        openDialog('ImexProgress', {})
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
    const configValue = this.state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        label={label}
        onChange={() => this.handleDeltaSettingsChange(configKey, flipDeltaBoolean(configValue))}
      />
    )
  }

  renderDeltaInput (configKey, label) {
    const configValue = this.state.settings[configKey]
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
    ipcRenderer.removeAllListeners('DC_EVENT_IMEX_FILE_WRITTEN')
  }

  renderDialogContent () {
    const { deltachat } = this.props
    const { userDetails, settings, advancedSettings } = this.state
    if (this.state.show === 'main') {
      return (
        <div>
          <Card elevation={Elevation.ONE}>
            <H5>{deltachat.credentials.addr}</H5>
            <Button onClick={() => this.setState({ show: 'login' })}>
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
            <Button onClick={this.onBackupExport}>{this.translate('pref_backup_export_start_button')}</Button>
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
            { this.renderDeltaSwitch('mdns_enabled', this.translate('pref_read_receipts')) }
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
        </div>
      )
    } else if (this.state.show === 'login') {
      return (
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
      )
    } else {
      throw new Error('Invalid state name: ' + this.state.name)
    }
  }

  render () {
    const { isOpen, onClose } = this.props
    const { keyTransfer } = this.state
    let title
    if (this.state.show === 'main') {
      title = this.translate('menu_settings')
    } else if (this.state.show === 'login') {
      title = this.translate('pref_password_and_account_settings')
    }

    return (
      <div>
        <SettingsDialogGlobal />
        <SendAutocryptSetupMessage isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <Dialog
          isOpen={isOpen}
          onClose={onClose}
          className='SettingsDialog'
        >
          <div class='bp3-dialog-header'>
            { this.state.show !== 'main' && <button onClick={() => this.setState({ show: 'main' })} class='bp3-button bp3-minimal bp3-icon-large bp3-icon-arrow-left' /> }
            <h4 class='bp3-heading'>{title}</h4>
            <button onClick={onClose} aria-label='Close' class='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross' />
          </div>
          <div className={Classes.DIALOG_BODY}>
            { this.renderDialogContent() }
          </div>
          <div className={Classes.DIALOG_FOOTER} />
        </Dialog>
      </div>
    )
  }
}
