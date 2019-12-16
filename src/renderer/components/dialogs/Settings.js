import React, { useState, useLayoutEffect } from 'react'
import crypto from 'crypto'
import { ipcRenderer, remote } from 'electron'
import { callDcMethodAsync } from '../../ipc'
import C from 'deltachat-node/constants'
import {
  Elevation,
  H5,
  Card,
  Classes,
  Button,
  Switch,
  Label,
  RadioGroup,
  Radio
} from '@blueprintjs/core'

import { DeltaDialogBase, DeltaDialogBody, DeltaDialogHeader } from './DeltaDialog'
import Login from '../Login'
import { confirmationDialogLegacy as confirmationDialog } from './ConfirmationDialog'
const SettingsContext = require('../../contexts/SettingsContext')
const MAGIC_PW = crypto.randomBytes(8).toString('hex')

function flipDeltaBoolean (value) {
  return value === '1' ? '0' : '1'
}

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      advancedSettings: {},
      showSettingsDialog: false,
      mail_pw: MAGIC_PW,
      settings: {},
      show: 'main',
      selfContact: {}
    }
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.onBackupExport = this.onBackupExport.bind(this)
    this.onKeysExport = this.onKeysExport.bind(this)
    this.onKeysImport = this.onKeysImport.bind(this)
    this.handleDesktopSettingsChange = this.handleDesktopSettingsChange.bind(this)
    this.handleDeltaSettingsChange = this.handleDeltaSettingsChange.bind(this)
    this.renderDTSettingSwitch = this.renderDTSettingSwitch.bind(this)
    this.renderDeltaSwitch = this.renderDeltaSwitch.bind(this)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
    this.translate = window.translate
  }

  async componentDidMount () {
    const settings = await callDcMethodAsync('settings.getConfigFor', [[
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
      'configured_imap_certificate_checks',
      'configured_send_user',
      'configured_send_pw',
      'configured_send_server',
      'configured_send_port',
      'configured_send_security',
      'configured_smtp_certificate_checks',
      'configured_e2ee_enabled',
      'displayname',
      'selfstatus',
      'mdns_enabled',
      'show_emails'
    ]])

    const advancedSettings = {
      mail_user: settings['configured_mail_user'],
      mail_server: settings['configured_mail_server'],
      mail_port: settings['configured_mail_port'],
      mail_security: settings['configured_mail_security'],
      imap_certificate_checks: settings['configured_imap_certificate_checks'],
      send_user: settings['configured_send_user'],
      send_pw: settings['configured_send_pw'],
      send_server: settings['configured_send_server'],
      send_port: settings['configured_send_port'],
      send_security: settings['configured_send_security'],
      smtp_certificate_checks: settings['configured_smtp_certificate_checks'],
      e2ee_enabled: settings['configured_e2ee_enabled']
    }

    const selfContact = await callDcMethodAsync('getContact', [C.DC_CONTACT_ID_SELF])

    this.setState({ settings, advancedSettings, selfContact })
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  onKeysImport () {
    const opts = {
      title: window.translate('pref_managekeys_import_secret_keys'),
      defaultPath: remote.app.getPath('downloads'),
      properties: ['openFile']
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

  /*
   * Saves settings for the Deltachat Desktop
   * persisted in ~/.config/DeltaChat/deltachat.json
   */
  handleDesktopSettingsChange (key, value) {
    ipcRenderer.send('updateDesktopSetting', key, value)
    if (key === 'notifications' && value === false) {
      ipcRenderer.send('updateDesktopSetting', 'showNotificationContent', false)
    }
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

  onCancelLogin () {
    ipcRenderer.send('cancelCredentialsUpdate')
  }

  /*
   * render switch for Desktop Setings
   */
  renderDTSettingSwitch (configKey, label) {
    return (
      <SettingsContext.Consumer>
        {(settings) => (
          <Switch
            checked={settings[configKey]}
            className={settings[configKey] ? 'active' : 'inactive'}
            label={label}
            disabled={configKey === 'showNotificationContent' && !settings['notifications']}
            onChange={() => this.handleDesktopSettingsChange(configKey, !settings[configKey])}
          />
        )}
      </SettingsContext.Consumer>)
  }

  renderDeltaSwitch (configKey, label) {
    const configValue = this.state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        className={configValue === '1' ? 'active' : 'inactive'}
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
    const { deltachat, openDialog } = this.props
    const { settings, advancedSettings } = this.state
    if (this.state.show === 'main') {
      return (
        <div>
          <Card elevation={Elevation.ONE}>
            <ProfileImageSelector
              displayName={this.state.settings['displayname'] || this.state.selfContact.address}
              color={this.state.selfContact.color}
            />
            <H5>{this.translate('pref_profile_info_headline')}</H5>
            <p>{deltachat.credentials.addr}</p>
            { this.renderDeltaInput('displayname', this.translate('pref_your_name'))}
            { this.renderDeltaInput('selfstatus', this.translate('pref_default_status_label'))}
            <Button onClick={() => this.setState({ show: 'login' })}>
              {this.translate('pref_password_and_account_settings')}
            </Button>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_communication')}</H5>
            <RadioGroup
              label={this.translate('pref_show_emails')}
              onChange={(ev) => this.handleDeltaSettingsChange('show_emails', ev.target.value)}
              selectedValue={Number(settings['show_emails'])}
            >
              <Radio label={this.translate('pref_show_emails_no')} value={C.DC_SHOW_EMAILS_OFF} />
              <Radio label={this.translate('pref_show_emails_accepted_contacts')} value={C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS} />
              <Radio label={this.translate('pref_show_emails_all')} value={C.DC_SHOW_EMAILS_ALL} />
            </RadioGroup>
            <br />
            <H5>{this.translate('pref_privacy')}</H5>
            { this.renderDeltaSwitch('mdns_enabled', this.translate('pref_read_receipts')) }
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_background')}</H5>
            <BackgroundSelector onChange={(val) => this.handleDesktopSettingsChange('chatViewBgImg', val)} />
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('autocrypt')}</H5>
            <br />
            { this.renderDeltaSwitch('e2ee_enabled', this.translate('autocrypt_prefer_e2ee'))}
            <Button onClick={() => openDialog('SendAutocryptSetupMessage')}>
              {this.translate('autocrypt_send_asm_button')}
            </Button>
            <br />
            <p style={{ marginTop: '10px' }}>{this.translate('autocrypt_explain')}</p>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_chats_and_media')}</H5>
            <br />
            { this.renderDTSettingSwitch('enterKeySends', this.translate('pref_enter_sends')) }
            <p>{this.translate('pref_enter_sends_explain')}</p>
            <br />
            { this.renderDTSettingSwitch('notifications', this.translate('pref_notifications')) }
            <p>{this.translate('pref_notifications_explain')}</p>
            <br />
            { this.renderDTSettingSwitch('showNotificationContent', this.translate('pref_show_notification_content')) }
            <p>{this.translate('pref_show_notification_content_explain')}</p>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_experimental_features')}</H5>
            { this.renderDTSettingSwitch('enableOnDemandLocationStreaming', this.translate('pref_on_demand_location_streaming')) }
            <br />
            <H5>{this.translate('pref_imap_folder_handling')}</H5>
            { this.renderDeltaSwitch('inbox_watch', this.translate('pref_watch_inbox_folder')) }
            { this.renderDeltaSwitch('sentbox_watch', this.translate('pref_watch_sent_folder')) }
            { this.renderDeltaSwitch('mvbox_watch', this.translate('pref_watch_mvbox_folder')) }
            { this.renderDeltaSwitch('mvbox_move', this.translate('pref_auto_folder_moves')) }
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_managekeys_menu_title')}</H5>
            <Button onClick={this.onKeysExport}>{this.translate('pref_managekeys_export_secret_keys')}...</Button>
            <Button onClick={this.onKeysImport}>{this.translate('pref_managekeys_import_secret_keys')}...</Button>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_backup')}</H5>
            <Button onClick={this.onBackupExport}>{this.translate('pref_backup_export_start_button')}</Button>
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
            onClose={() => this.setState({ showSettingsDialog: false })}
            onCancel={this.onCancelLogin}
            addrDisabled
          >
            <Button type='submit' text={this.translate('update')} />
            <Button type='cancel' text={this.translate('cancel')} />
          </Login>
        </Card>
      )
    } else {
      throw new Error('Invalid state name: ' + this.state.name)
    }
  }

  render () {
    const { onClose } = this.props
    let title
    if (this.state.show === 'main') {
      title = this.translate('menu_settings')
    } else if (this.state.show === 'login') {
      title = this.translate('pref_password_and_account_settings')
    }

    return (
      <DeltaDialogBase
        isOpen={this.props.isOpen}
        onClose={() => this.setState({ showSettingsDialog: false })}
        className='SettingsDialog'
        fixed
      >
        <DeltaDialogHeader
          showBackButton={this.state.show !== 'main'}
          onClickBack={() => this.setState({ show: 'main' })}
          title={title}
          onClose={onClose}
        />
        <DeltaDialogBody noFooter>
          { this.renderDialogContent() }
        </DeltaDialogBody>
      </DeltaDialogBase>
    )
  }
}

class BackgroundSelector extends React.Component {
  constructor () {
    super()
    this.fileInput = React.createRef()
    this.colorInput = document.getElementById('color-input') // located in index.html outside of react
    this.colorInput.onchange = ev => this.onColor.bind(this)(ev)
  }

  componentWillUnmount () {
    this.colorInput.onchange = null
  }

  render () {
    const tx = window.translate
    return (
      <div>
        <div className={'bg-option-wrap'}>
          <SettingsContext.Consumer>
            {(settings) => (
              <div
                style={{ backgroundImage: settings['chatViewBgImg'], backgroundSize: 'cover' }}
                aria-label={tx('a11y_background_preview_label')}
                className={'background-preview'}
              />
            )}
          </SettingsContext.Consumer>
          <div className={'background-options'}>
            <button onClick={this.onButton.bind(this, 'def')} className={'bp3-button'}>{tx('pref_background_default')}</button>
            <button onClick={this.onButton.bind(this, 'def_color')} className={'bp3-button'}>{tx('pref_background_default_color')}</button>
            <button onClick={this.onButton.bind(this, 'image')} className={'bp3-button'}>{tx('pref_background_custom_image')}</button>
            <button onClick={this.onButton.bind(this, 'color')} className={'bp3-button'}>{tx('pref_background_custom_color')}</button>
          </div>
        </div>
        <div className={'background-default-images'}>
          { [
            'flower.webp',
            'bee.webp',
            'wheat.webp',
            'mm-1.webp',
            'mm-2.webp',
            'lake-tekapo.jpg',
            'nz-beach.webp',
            'petito-moreno.webp'
          ].map((elem) => <div onClick={this.onButton.bind(this, 'pimage')} style={{ backgroundImage: `url(../images/backgrounds/${elem})` }} key={elem} data-url={elem} />) }
        </div>
      </div>
    )
  }

  setValue (val) {
    this.props.onChange(val)
  }

  onButton (type, ev) {
    switch (type) {
      case 'def':
        this.setValue(undefined)
        break
      case 'def_color':
        this.setValue('var(--chatViewBg)')
        break
      case 'image':
        ipcRenderer.send('selectBackgroundImage')
        break
      case 'pimage':
        ipcRenderer.send('selectBackgroundImage', ev.target.dataset.url)
        break
      case 'color':
        this.colorInput && this.colorInput.click()
        break
      default:
        /* ignore-console-log */
        console.error("this shouldn't happen")
    }
  }

  onColor (ev) {
    // TODO debounce
    this.setValue(ev.target.value)
  }
}

function ProfileImageSelector (props) {
  const { displayName, color } = props
  const tx = window.translate
  const [profileImagePreview, setProfileImagePreview] = useState('')
  useLayoutEffect(_ => {
    callDcMethodAsync('getProfilePicture').then(setProfileImagePreview)
    // return nothing because reacts wants it like that
  })

  const changeProfilePicture = async (picture) => {
    await callDcMethodAsync('setProfilePicture', [picture])
    setProfileImagePreview(await callDcMethodAsync('getProfilePicture'))
  }

  const openSelectionDialog = () => {
    remote.dialog.showOpenDialog({
      title: tx('select_profile_image_desktop'),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
      properties: ['openFile']
    }, async files => {
      if (Array.isArray(files) && files.length > 0) {
        changeProfilePicture(files[0])
      }
    })
  }

  const codepoint = displayName && displayName.codePointAt(0)
  const initial = codepoint ? String.fromCodePoint(codepoint).toUpperCase() : '#'

  return <div className='profile-image-selector'>
    {/* TODO: show anything else when there is no profile image, like the letter avatar */}
    {
      profileImagePreview
        ? <img src={profileImagePreview} alt={tx('a11y_profile_image_label')} />
        : <span style={{ backgroundColor: color }}>{initial}</span>
    }
    <div>
      {/* TODO: replace the text by icons that get described by aria-label */}
      <button aria-label={tx('a11y_profile_image_select')} onClick={openSelectionDialog} className={'bp3-button'}>Select</button>
      {profileImagePreview &&
      <button aria-label={tx('a11y_profile_image_remove')} onClick={changeProfilePicture.bind(null, '')} className={'bp3-button'}>Remove</button>}
    </div>
  </div>
}
