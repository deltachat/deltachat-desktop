import React, { useState, useEffect, useContext } from 'react'
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
  Callout,
} from '@blueprintjs/core'

import LoginForm from '../LoginForm'
import { confirmationDialogLegacy as confirmationDialog } from './ConfirmationDialog'
import { ThemeManager } from '../../ThemeManager'
const { remote } = window.electron_functions
const { ipcRenderer } = window.electron_functions
import { SettingsContext } from '../../contexts'

import { OpenDialogOptions } from 'electron'
import { AppState, DesktopSettings } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import SettingsAutodelete from './Settings-Autodelete'
import SettingsManageKeys from './Settings-ManageKeys'
import SettingsEncryption from './Settings-Encryption'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
} from './DeltaDialog'
import SettingsBackup from './Settings-Backup'
import SettingsAccount from './Settings-Account'
import SettingsAppearance from './Settings-Appearance'

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

export default function Settings(props: DialogProps) {
  const [state, _setState] = useState<{
    showSettingsDialog: boolean,
    settings: any,
    show: string,
    selfContact: todo,
  }>({
    showSettingsDialog: false,
    settings: {},
    show: 'main',
    selfContact: {},
  })
  const setState = (updatedState: any) => {
    _setState((prevState: any) => {
      return {...prevState, ...updatedState}
    })
  }

  const setShow = (show: string) => setState({ show })
  const { desktopSettings, setDesktopSetting } = useContext(SettingsContext)

  const tx = window.translate


  const loadSettings = async () => {
    const settings = await DeltaBackend.call('settings.getConfigFor', [
      'inbox_watch',
      'sentbox_watch',
      'mvbox_watch',
      'mvbox_move',
      'e2ee_enabled',
      'displayname',
      'selfstatus',
      'mdns_enabled',
      'show_emails',
      'bcc_self',
      'delete_device_after',
      'delete_server_after',
    ])

    setState({ settings })
  }

  const onKeyTransferComplete = () => setState({ keyTransfer: false })

  /*
   * Saves settings for the Deltachat Desktop
   * persisted in ~/.config/DeltaChat/deltachat.json
   */
  const handleDesktopSettingsChange = async (key: keyof DesktopSettings, value: string | boolean | number) => {
    if (key === 'notifications' && !value) {
      key = 'showNotificationContent'
      value = false
    }

    if (await DeltaBackend.call('settings.setDesktopSetting', key, value) === true) {
      setDesktopSetting(key, value)
    }
  }

  /** Saves settings to deltachat core */
  const handleDeltaSettingsChange = (key: string, value: string | boolean) => {
    ipcRenderer.sendSync('setConfig', key, value)
    const settings = state.settings
    settings[key] = String(value)
    setState({ settings })
  }

  /*
   * render switch for Desktop Setings
   */
  const renderDTSettingSwitch = (configKey: keyof DesktopSettings, label: string) => {
    return (
      <Switch
        checked={desktopSettings[configKey] === true}
        className={desktopSettings[configKey] ? 'active' : 'inactive'}
        label={label}
        disabled={
          configKey === 'showNotificationContent' &&
          !desktopSettings['notifications']
        }
        onChange={() =>
          handleDesktopSettingsChange(configKey, !desktopSettings[configKey])
        }
        alignIndicator='right'
      />
    )
  }

  const renderDeltaSwitch = (configKey: string, label: string) => {
    const configValue = state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        className={configValue === '1' ? 'active' : 'inactive'}
        label={label}
        onChange={() =>
          handleDeltaSettingsChange(
            configKey,
            flipDeltaBoolean(configValue)
          )
        }
        alignIndicator='right'
      />
    )
  }

  const renderDeltaInput = (configKey: string, label: string) => {
    const configValue = state.settings[configKey]
    return (
      <Label>
        {label}
        <input
          value={configValue}
          className={Classes.INPUT}
          onChange={ev =>
            handleDeltaSettingsChange(configKey, ev.target.value)
          }
        />
      </Label>
    )
  }

  const renderDialogContent = () => {
    const { deltachat, openDialog } = props
    const { settings } = state
    if (state.show === 'main') {
      return (
        <DeltaDialogBody noFooter>
          <Card elevation={Elevation.ONE}>
            <ProfileImageSelector
              displayName={
                state.settings['displayname'] ||
                state.selfContact.address
              }
              color={state.selfContact.color}
            />
            <H5>{tx('pref_profile_info_headline')}</H5>
            <p>{deltachat.credentials.addr}</p>
            {renderDeltaInput(
              'displayname',
              tx('pref_your_name')
            )}
            {renderDeltaInput(
              'selfstatus',
              tx('pref_default_status_label')
            )}
            <SettingsButton onClick={() => setState({ show: 'login' })}>
              {tx('pref_password_and_account_settings')}
            </SettingsButton>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{tx('pref_communication')}</H5>
            <RadioGroup
              label={tx('pref_show_emails')}
              onChange={(ev: React.FormEvent<HTMLInputElement>) =>
                handleDeltaSettingsChange(
                  'show_emails',
                  ev.currentTarget.value
                )
              }
              selectedValue={Number(settings['show_emails'])}
            >
              <Radio
                label={tx('pref_show_emails_no')}
                value={C.DC_SHOW_EMAILS_OFF}
              />
              <Radio
                label={tx('pref_show_emails_accepted_contacts')}
                value={C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS}
              />
              <Radio
                label={tx('pref_show_emails_all')}
                value={C.DC_SHOW_EMAILS_ALL}
              />
            </RadioGroup>
            <br />
            <H5>{tx('pref_privacy')}</H5>
            {renderDeltaSwitch(
              'mdns_enabled',
              tx('pref_read_receipts')
            )}
            <br />
            <SettingsAutodelete
              {...{
                handleDeltaSettingsChange: handleDeltaSettingsChange,
                settings,
              }}
            />
          </Card>
          <SettingsAppearance
            handleDesktopSettingsChange={handleDesktopSettingsChange}
          />
          <SettingsEncryption renderDeltaSwitch={renderDeltaSwitch} />
          <Card elevation={Elevation.ONE}>
            <H5>{tx('pref_chats_and_media')}</H5>
            {renderDTSettingSwitch(
              'enterKeySends',
              tx('pref_enter_sends_explain')
            )}
            {renderDTSettingSwitch(
              'notifications',
              tx('pref_notifications_explain')
            )}
            {renderDTSettingSwitch(
              'showNotificationContent',
              tx('pref_show_notification_content_explain')
            )}
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{tx('pref_experimental_features')}</H5>
            {renderDTSettingSwitch(
              'enableOnDemandLocationStreaming',
              tx('pref_on_demand_location_streaming')
            )}
            <br />
            <H5>{tx('pref_imap_folder_handling')}</H5>
            {renderDeltaSwitch(
              'inbox_watch',
              tx('pref_watch_inbox_folder')
            )}
            {renderDeltaSwitch(
              'sentbox_watch',
              tx('pref_watch_sent_folder')
            )}
            {renderDeltaSwitch(
              'mvbox_watch',
              tx('pref_watch_mvbox_folder')
            )}
            {renderDeltaSwitch(
              'bcc_self',
              tx('pref_send_copy_to_self')
            )}
            {renderDeltaSwitch(
              'mvbox_move',
              tx('pref_auto_folder_moves')
            )}
          </Card>
          <SettingsManageKeys />
          <SettingsBackup />
        </DeltaDialogBody>
      )
    } else if (state.show === 'login') {
      return (
        <SettingsAccount
          deltachat={deltachat}
          show={state.show}
          setShow={setShow}
          onClose={props.onClose}
        />
      )
    } else {
      throw new Error('Invalid state name: ' + state.show)
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadSettings()
      const selfContact = await DeltaBackend.call(
        'contacts.getContact',
        C.DC_CONTACT_ID_SELF
      )
      setState({ selfContact })
    })()
    return () => ipcRenderer.removeAllListeners('DC_EVENT_IMEX_FILE_WRITTEN')
  }, [])

  const { onClose } = props
  let title
  if (state.show === 'main') {
    title = tx('menu_settings')
  } else if (state.show === 'login') {
    title = tx('pref_password_and_account_settings')
  }

  return (
    <DeltaDialogBase
      isOpen={props.isOpen}
      onClose={() => setState({ showSettingsDialog: false })}
      className='SettingsDialog'
      fixed
    >
      <DeltaDialogHeader
        showBackButton={state.show !== 'main'}
        onClickBack={() => setState({ show: 'main' })}
        title={title}
        onClose={onClose}
      />
      {renderDialogContent()}
    </DeltaDialogBase>
  )
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
