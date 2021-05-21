import React, { useState, useEffect, useContext, useRef } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import { Elevation, H5, Card, Classes, Switch, Label } from '@blueprintjs/core'

const { ipcRenderer } = window.electron_functions
import { SettingsContext, useTranslationFunction } from '../../contexts'

import { DesktopSettings, RC_Config } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import SettingsAutodelete from './Settings-Autodelete'
import SettingsManageKeys from './Settings-ManageKeys'
import SettingsEncryption from './Settings-Encryption'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogCloseFooter,
} from './DeltaDialog'
import SettingsBackup from './Settings-Backup'
import SettingsAccount from './Settings-Account'
import SettingsAppearance from './Settings-Appearance'
import SettingsProfile, { SettingsEditProfile } from './Settings-Profile'
import { getLogger } from '../../../shared/logger'
import SettingsCommunication from './Settings-Communication'
import { runtime } from '../../runtime'

const log = getLogger('renderer/dialogs/Settings')

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

function DeltaSettingsInput({
  configKey,
  label,
  style,
}: {
  configKey: string
  label: string
  style?: React.CSSProperties
}) {
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (input.current) {
      input.current.disabled = true
    }
    DeltaBackend.call('settings.getConfigFor', [configKey]).then(res => {
      input.current.value = res[configKey]
      input.current.disabled = false
    })
  }, [configKey])

  return (
    <Label>
      {label}
      <input
        ref={input}
        style={style}
        className={Classes.INPUT}
        onChange={ev => {
          const value = ev.target.value
          DeltaBackend.call('settings.setConfig', configKey, value).catch(
            log.warn.bind(
              null,
              'settings.setConfig returned false for:',
              configKey,
              value
            )
          )
        }}
      />
    </Label>
  )
}

export default function Settings(props: DialogProps) {
  useEffect(() => {
    if (window.__settingsOpened) {
      throw new Error(
        'Settings window was already open - this should not happen, please file a bug'
      )
    }
    window.__settingsOpened = true
    return () => {
      window.__settingsOpened = false
    }
  })

  const [state, _setState] = useState<{
    showSettingsDialog: boolean
    settings: any
    show: string
    selfContact: todo
    rc: RC_Config
  }>({
    showSettingsDialog: false,
    settings: {},
    show: 'main',
    selfContact: {},
    rc: ({} as any) as RC_Config,
  })
  const setState = (updatedState: any) => {
    _setState((prevState: any) => {
      return { ...prevState, ...updatedState }
    })
  }

  const setShow = (show: string) => setState({ show })
  const { desktopSettings, setDesktopSetting } = useContext(SettingsContext)

  const tx = useTranslationFunction()

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
      'webrtc_instance',
    ])
    setState({ settings })

    const rc = await runtime.getRC_Config()
    setState({ rc })
  }

  /*
   * Saves settings for the Deltachat Desktop
   * persisted in ~/.config/DeltaChat/deltachat.json
   */
  const handleDesktopSettingsChange = async (
    key: keyof DesktopSettings,
    value: string | boolean | number
  ) => {
    if (
      (await DeltaBackend.call('settings.setDesktopSetting', key, value)) ===
      true
    ) {
      setDesktopSetting(key, value)
    }
  }

  /** Saves settings to deltachat core */
  const handleDeltaSettingsChange = async (
    key: string,
    value: string | boolean
  ) => {
    if ((await DeltaBackend.call('settings.setConfig', key, value)) === true) {
      _setState((settings: any) => {
        return {
          ...settings,
          settings: {
            ...settings.settings,
            [key]: String(value),
          },
        }
      })
      return
    }
    log.warn('settings.setConfig returned false for: ', key, value)
  }

  /*
   * render switch for Desktop Setings
   */
  const renderDTSettingSwitch = (
    configKey: keyof DesktopSettings,
    label: string,
    disabled = false,
    disabled_is_checked = false
  ) => {
    return (
      <Switch
        checked={desktopSettings[configKey] === true || disabled_is_checked}
        className={desktopSettings[configKey] ? 'active' : 'inactive'}
        label={label}
        disabled={disabled}
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
          handleDeltaSettingsChange(configKey, flipDeltaBoolean(configValue))
        }
        alignIndicator='right'
      />
    )
  }

  const renderDialogContent = () => {
    const { account } = props
    const { settings } = state

    if (
      Object.keys(settings || {}).length === 0 ||
      Object.keys(account || {}).length === 0
    ) {
      return null
    }

    if (state.show === 'main') {
      return (
        <>
          <DeltaDialogBody>
            <SettingsProfile
              show={state.show}
              setShow={setShow}
              onClose={props.onClose}
              account={account}
              state={state}
            />
            <Card elevation={Elevation.ONE}>
              <SettingsCommunication
                {...{
                  handleDeltaSettingsChange: handleDeltaSettingsChange,
                  settings,
                }}
              />
              <br />
              <H5>{tx('pref_privacy')}</H5>
              {renderDeltaSwitch('mdns_enabled', tx('pref_read_receipts'))}
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
                tx('pref_show_notification_content_explain'),
                !desktopSettings['notifications']
              )}
            </Card>
            <Card elevation={Elevation.ONE}>
              <H5>{tx('pref_experimental_features')}</H5>
              {renderDTSettingSwitch(
                'enableOnDemandLocationStreaming',
                tx('pref_on_demand_location_streaming')
              )}
              {renderDTSettingSwitch(
                'minimizeToTray',
                tx('pref_show_tray_icon'),
                state.rc?.minimized,
                state.rc?.minimized
              )}
              {state.rc?.minimized && (
                <div className='bp3-callout'>
                  {tx('explain_desktop_minimized_disabled_tray_pref')}
                </div>
              )}
              {renderDTSettingSwitch(
                'enableChatAuditLog',
                tx('menu_chat_audit_log')
              )}
              {renderDTSettingSwitch('enableAVCalls', tx('videochat'))}
              {desktopSettings['enableAVCalls'] === true && (
                <>
                  <DeltaSettingsInput
                    configKey='webrtc_instance'
                    label={tx('videochat_instance')}
                    style={{ width: '100%' }}
                  />
                  <div className='bp3-callout'>
                    {tx('videochat_instance_explain')}
                  </div>
                </>
              )}
              <br />
              <H5>{tx('pref_imap_folder_handling')}</H5>
              {renderDeltaSwitch('inbox_watch', tx('pref_watch_inbox_folder'))}
              {renderDeltaSwitch('sentbox_watch', tx('pref_watch_sent_folder'))}
              {renderDeltaSwitch('mvbox_watch', tx('pref_watch_mvbox_folder'))}
              {renderDeltaSwitch('bcc_self', tx('pref_send_copy_to_self'))}
              {renderDeltaSwitch('mvbox_move', tx('pref_auto_folder_moves'))}
            </Card>
            <SettingsManageKeys />
            <SettingsBackup />
          </DeltaDialogBody>
          <DeltaDialogCloseFooter onClose={onClose} />
        </>
      )
    } else if (state.show === 'edit-profile') {
      return (
        <SettingsEditProfile
          show={state.show}
          setShow={setShow}
          onClose={props.onClose}
          state={state}
          handleDeltaSettingsChange={handleDeltaSettingsChange}
        />
      )
    } else if (state.show === 'login') {
      return (
        <SettingsAccount
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
  } else if (state.show === 'edit-profile') {
    title = tx('pref_edit_profile')
  }

  return (
    <DeltaDialogBase
      isOpen={props.isOpen}
      onClose={() => {
        setState({ showSettingsDialog: false })
        props.onClose()
      }}
      className='SettingsDialog'
      fixed
    >
      <DeltaDialogHeader title={title} />
      {renderDialogContent()}
    </DeltaDialogBase>
  )
}
