import React, { useState, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import {
  Elevation,
  H5,
  H6,
  Card,
  Classes,
  Button,
  Switch,
  Label,
  RadioGroup,
  Radio,
  HTMLSelect,
} from '@blueprintjs/core'

import Login from '../Login'
import { confirmationDialogLegacy as confirmationDialog } from './ConfirmationDialog'
import { ThemeManager } from '../../ThemeManager'
const { remote } = window.electron_functions
const { ipcRenderer } = window.electron_functions
const { SettingsContext } = require('../../contexts')
const MAGIC_PW = '9bbdc87b50bbc684'
import { OpenDialogOptions } from 'electron'
import { AppState } from '../../../shared/shared-types'
import { DialogProps } from '.'
import SettingsAutodelete from './Settings-Autodelete'
import SettingsManageKeys from './Settings-ManageKeys'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
} from './DeltaDialog'
import SettingsBackup from './Settings-Backup'

function flipDeltaBoolean(value: string) {
  return value === '1' ? '0' : '1'
}

export function SettingsButton(props: any) {
  const { onClick, children, ...otherProps } = props
  return (
    <div className='SettingsButton' onClick={onClick}>
      <button {...otherProps}>{children}</button>
    </div>
  )
}

export function SettingsSelector(props: any) {
  const { onClick, currentValue, children, ...otherProps } = props
  return (
    <div className='SettingsSelector' onClick={onClick}>
      <button {...otherProps}>{children}</button>
      <div className='CurrentValue'>{currentValue}</div>
    </div>
  )
}

export default class Settings extends React.Component {
  translate: todo
  state: {
    advancedSettings: todo
    showSettingsDialog: boolean
    mail_pw: string
    settings: todo
    show: string
    selfContact: todo
  }
  constructor(public props: DialogProps) {
    super(props)
    this.state = {
      advancedSettings: {},
      showSettingsDialog: false,
      mail_pw: MAGIC_PW,
      settings: {},
      show: 'main',
      selfContact: {},
      availableThemes: [],
    }
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.handleDesktopSettingsChange = this.handleDesktopSettingsChange.bind(
      this
    )
    this.handleDeltaSettingsChange = this.handleDeltaSettingsChange.bind(this)
    this.renderDTSettingSwitch = this.renderDTSettingSwitch.bind(this)
    this.renderDeltaSwitch = this.renderDeltaSwitch.bind(this)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
    this.translate = window.translate
  }

  async componentDidMount() {
    await this.loadSettings()
    const selfContact = await DeltaBackend.call(
      'contacts.getContact',
      C.DC_CONTACT_ID_SELF
    )
    this.setState({ selfContact })
    const availableThemes = await DeltaBackend.call('extras.getAvailableThemes')
    this.setState({ availableThemes })
  }

  async loadSettings() {
    const settings = await DeltaBackend.call('settings.getConfigFor', [
      'addr',
      'mail_pw',
      'inbox_watch',
      'sentbox_watch',
      'mvbox_watch',
      'mvbox_move',
      'e2ee_enabled',
      'mail_server',
      'mail_user',
      'mail_port',
      'mail_security',
      'imap_certificate_checks',
      'send_user',
      'send_pw',
      'send_server',
      'send_port',
      'send_security',
      'smtp_certificate_checks',
      'e2ee_enabled',
      'displayname',
      'selfstatus',
      'mdns_enabled',
      'show_emails',
      'bcc_self',
      'delete_device_after',
      'delete_server_after',
    ])

    const advancedSettings = {
      mail_user: settings['mail_user'],
      mail_server: settings['mail_server'],
      mail_port: settings['mail_port'],
      mail_security: settings['mail_security'],
      imap_certificate_checks: settings['imap_certificate_checks'],
      send_user: settings['send_user'],
      send_pw: settings['send_pw'],
      send_server: settings['send_server'],
      send_port: settings['send_port'],
      send_security: settings['send_security'],
      smtp_certificate_checks: settings['smtp_certificate_checks'],
      e2ee_enabled: settings['e2ee_enabled'],
    }

    this.setState({ settings, advancedSettings })
  }

  onKeyTransferComplete() {
    this.setState({ keyTransfer: false })
  }

  /*
   * Saves settings for the Deltachat Desktop
   * persisted in ~/.config/DeltaChat/deltachat.json
   */
  handleDesktopSettingsChange(key: string, value: string | boolean) {
    ipcRenderer.send('updateDesktopSetting', key, value)
    if (key === 'notifications' && !value) {
      ipcRenderer.send('updateDesktopSetting', 'showNotificationContent', false)
    }
  }

  /** Saves settings to deltachat core */
  handleDeltaSettingsChange(key: string, value: string | boolean) {
    ipcRenderer.sendSync('setConfig', key, value)
    const settings = this.state.settings
    settings[key] = String(value)
    this.setState({ settings })
  }

  onLoginSubmit(config: todo) {
    const { closeDialog } = this.props
    this.props.userFeedback(false)
    if (config.mail_pw === MAGIC_PW) delete config.mail_pw
    ipcRenderer.send('updateCredentials', config)
    ipcRenderer.once('DC_EVENT_CONFIGURE_FAILED', () => {
      closeDialog('Settings')
    })
  }

  onLoginSuccess() {
    this.loadSettings()
  }

  onCancelLogin() {
    // not yet implemented in core (issue #1159)
    ipcRenderer.send('cancelCredentialsUpdate')
  }

  /*
   * render switch for Desktop Setings
   */
  renderDTSettingSwitch(configKey: string, label: string) {
    return (
      <SettingsContext.Consumer>
        {(settings: todo) => (
          <Switch
            checked={settings[configKey]}
            className={settings[configKey] ? 'active' : 'inactive'}
            label={label}
            disabled={
              configKey === 'showNotificationContent' &&
              !settings['notifications']
            }
            onChange={() =>
              this.handleDesktopSettingsChange(configKey, !settings[configKey])
            }
          />
        )}
      </SettingsContext.Consumer>
    )
  }

  renderDeltaSwitch(configKey: string, label: string) {
    const configValue = this.state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        className={configValue === '1' ? 'active' : 'inactive'}
        label={label}
        onChange={() =>
          this.handleDeltaSettingsChange(
            configKey,
            flipDeltaBoolean(configValue)
          )
        }
      />
    )
  }

  renderDeltaInput(configKey: string, label: string) {
    const configValue = this.state.settings[configKey]
    return (
      <Label>
        {label}
        <input
          value={configValue}
          className={Classes.INPUT}
          onChange={ev =>
            this.handleDeltaSettingsChange(configKey, ev.target.value)
          }
        />
      </Label>
    )
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('DC_EVENT_IMEX_FILE_WRITTEN')
  }

  renderThemeSelection() {
    return (
      <SettingsContext.Consumer>
        {settings => (
          <div>
            <H6>{this.translate('pref_theming')}</H6>
            <div className='theme-meta'>
              <b>
                <p className='name'></p>
              </b>
              <p className='description'></p>
            </div>
            <HTMLSelect
              onChange={async ev => {
                await DeltaBackend.call('extras.setTheme', ev.target.value)
                await ThemeManager.refresh()
                this.forceUpdate()
              }}
              value={settings['activeTheme']}
            >
              <option key={'system'} value={'system'}>
                {this.translate('pref_system_theme')}
              </option>
              {this.state.availableThemes?.map(theme => (
                <option key={theme.address} value={theme.address}>
                  {theme.name} - {theme.description} [{theme.address}]
                </option>
              ))}
            </HTMLSelect>
            <br />
          </div>
        )}
      </SettingsContext.Consumer>
    )
  }

  renderDialogContent() {
    const { deltachat, openDialog } = this.props
    const { settings, advancedSettings } = this.state
    if (this.state.show === 'main') {
      return (
        <div>
          <Card elevation={Elevation.ONE}>
            <ProfileImageSelector
              displayName={
                this.state.settings['displayname'] ||
                this.state.selfContact.address
              }
              color={this.state.selfContact.color}
            />
            <H5>{this.translate('pref_profile_info_headline')}</H5>
            <p>{deltachat.credentials.addr}</p>
            {this.renderDeltaInput(
              'displayname',
              this.translate('pref_your_name')
            )}
            {this.renderDeltaInput(
              'selfstatus',
              this.translate('pref_default_status_label')
            )}
            <Button onClick={() => this.setState({ show: 'login' })}>
              {this.translate('pref_password_and_account_settings')}
            </Button>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_communication')}</H5>
            <RadioGroup
              label={this.translate('pref_show_emails')}
              onChange={(ev: React.FormEvent<HTMLInputElement>) =>
                this.handleDeltaSettingsChange(
                  'show_emails',
                  ev.currentTarget.value
                )
              }
              selectedValue={Number(settings['show_emails'])}
            >
              <Radio
                label={this.translate('pref_show_emails_no')}
                value={C.DC_SHOW_EMAILS_OFF}
              />
              <Radio
                label={this.translate('pref_show_emails_accepted_contacts')}
                value={C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS}
              />
              <Radio
                label={this.translate('pref_show_emails_all')}
                value={C.DC_SHOW_EMAILS_ALL}
              />
            </RadioGroup>
            <br />
            <H5>{this.translate('pref_privacy')}</H5>
            {this.renderDeltaSwitch(
              'mdns_enabled',
              this.translate('pref_read_receipts')
            )}
            <br />
            <SettingsAutodelete
              {...{
                handleDeltaSettingsChange: this.handleDeltaSettingsChange,
                settings,
              }}
            />
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_background')}</H5>
            <BackgroundSelector
              onChange={(val: string) =>
                this.handleDesktopSettingsChange('chatViewBgImg', val)
              }
            />
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('autocrypt')}</H5>
            <br />
            {this.renderDeltaSwitch(
              'e2ee_enabled',
              this.translate('autocrypt_prefer_e2ee')
            )}
            <br />
            <SettingsButton
              style={{ color: 'var(--colorPrimary)', fontWeight: 'lighter' }}
              onClick={() => openDialog('SendAutocryptSetupMessage')}
            >
              {this.translate('autocrypt_send_asm_button')}
            </SettingsButton>
            <div className='bp3-callout'>
              {this.translate('autocrypt_explain')}
            </div>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_chats_and_media')}</H5>
            <br />
            {this.renderDTSettingSwitch(
              'enterKeySends',
              this.translate('pref_enter_sends')
            )}
            <p>{this.translate('pref_enter_sends_explain')}</p>
            <br />
            {this.renderDTSettingSwitch(
              'notifications',
              this.translate('pref_notifications')
            )}
            <p>{this.translate('pref_notifications_explain')}</p>
            <br />
            {this.renderDTSettingSwitch(
              'showNotificationContent',
              this.translate('pref_show_notification_content')
            )}
            <p>{this.translate('pref_show_notification_content_explain')}</p>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_experimental_features')}</H5>
            {this.renderDTSettingSwitch(
              'enableOnDemandLocationStreaming',
              this.translate('pref_on_demand_location_streaming')
            )}
            {this.renderThemeSelection()}
            <br />
            <H5>{this.translate('pref_imap_folder_handling')}</H5>
            {this.renderDeltaSwitch(
              'inbox_watch',
              this.translate('pref_watch_inbox_folder')
            )}
            {this.renderDeltaSwitch(
              'sentbox_watch',
              this.translate('pref_watch_sent_folder')
            )}
            {this.renderDeltaSwitch(
              'mvbox_watch',
              this.translate('pref_watch_mvbox_folder')
            )}
            {this.renderDeltaSwitch(
              'bcc_self',
              this.translate('pref_send_copy_to_self')
            )}
            {this.renderDeltaSwitch(
              'mvbox_move',
              this.translate('pref_auto_folder_moves')
            )}
          </Card>
          <SettingsManageKeys />
          <SettingsBackup />
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
            <Button type='reset' text={this.translate('cancel')} />
          </Login>
        </Card>
      )
    } else {
      throw new Error('Invalid state name: ' + this.state.show)
    }
  }

  render() {
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
        <DeltaDialogBody noFooter>{this.renderDialogContent()}</DeltaDialogBody>
      </DeltaDialogBase>
    )
  }
}

class BackgroundSelector extends React.Component {
  fileInput: todo
  colorInput: todo
  constructor(
    public props: {
      onChange: (value: string) => void
    }
  ) {
    super(props)
    this.fileInput = React.createRef()
    this.colorInput = document.getElementById('color-input') // located in index.html outside of react
    this.colorInput.onchange = (ev: any) => this.onColor.bind(this)(ev)
  }

  componentWillUnmount() {
    this.colorInput.onchange = null
  }

  render() {
    const tx = window.translate
    return (
      <div>
        <div className={'bg-option-wrap'}>
          <SettingsContext.Consumer>
            {(settings: any) => (
              <div
                style={{
                  backgroundImage: settings['chatViewBgImg'],
                  backgroundSize: 'cover',
                }}
                aria-label={tx('a11y_background_preview_label')}
                className={'background-preview'}
              />
            )}
          </SettingsContext.Consumer>
          <div className={'background-options'}>
            <button
              onClick={this.onButton.bind(this, 'def')}
              className={'bp3-button'}
            >
              {tx('pref_background_default')}
            </button>
            <button
              onClick={this.onButton.bind(this, 'def_color')}
              className={'bp3-button'}
            >
              {tx('pref_background_default_color')}
            </button>
            <button
              onClick={this.onButton.bind(this, 'image')}
              className={'bp3-button'}
            >
              {tx('pref_background_custom_image')}
            </button>
            <button
              onClick={this.onButton.bind(this, 'color')}
              className={'bp3-button'}
            >
              {tx('pref_background_custom_color')}
            </button>
          </div>
        </div>
        <div className={'background-default-images'}>
          {[
            'flower.webp',
            'bee.webp',
            'wheat.webp',
            'mm-1.webp',
            'mm-2.webp',
            'lake-tekapo.jpg',
            'nz-beach.webp',
            'petito-moreno.webp',
          ].map(elem => (
            <div
              onClick={this.onButton.bind(this, 'pimage')}
              style={{
                backgroundImage: `url(../images/backgrounds/thumb/${elem})`,
              }}
              key={elem}
              data-url={elem}
            />
          ))}
        </div>
      </div>
    )
  }

  setValue(val: string) {
    this.props.onChange(val)
  }

  onButton(type: string, ev: any) {
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

  onColor(ev: any) {
    // TODO debounce
    this.setValue(ev.target.value)
  }
}

function ProfileImageSelector(props: any) {
  const { displayName, color } = props
  const tx = window.translate
  const [profileImagePreview, setProfileImagePreview] = useState('')
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    // return nothing because reacts wants it like that
  }, [profileImagePreview])

  const changeProfilePicture = async (picture: string) => {
    await DeltaBackend.call('setProfilePicture', picture)
    setProfileImagePreview(await DeltaBackend.call('getProfilePicture'))
  }

  const openSelectionDialog = () => {
    remote.dialog.showOpenDialog(
      {
        title: tx('select_profile_image_desktop'),
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
        properties: ['openFile'],
      },
      async (files: string[]) => {
        if (Array.isArray(files) && files.length > 0) {
          changeProfilePicture(files[0])
        }
      }
    )
  }

  const codepoint = displayName && displayName.codePointAt(0)
  const initial = codepoint
    ? String.fromCodePoint(codepoint).toUpperCase()
    : '#'

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profileImagePreview ? (
        <img src={profileImagePreview} alt={tx('a11y_profile_image_label')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <div>
        {/* TODO: replace the text by icons that get described by aria-label */}
        <button
          aria-label={tx('a11y_profile_image_select')}
          onClick={openSelectionDialog}
          className={'bp3-button'}
        >
          Select
        </button>
        {profileImagePreview && (
          <button
            aria-label={tx('a11y_profile_image_remove')}
            onClick={changeProfilePicture.bind(null, '')}
            className={'bp3-button'}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
