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
import SettingsImapFolderHandling from './Settings-ImapFolderHandling'
import { SettingsExperimentalFeatures } from './Settings-ExperimentalFeatures'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaSwitch2,
} from './DeltaDialog'
import SettingsBackup from './Settings-Backup'
import SettingsAppearance from './Settings-Appearance'
import SettingsProfile from './Settings-Profile'
import { getLogger } from '../../../shared/logger'
import SettingsCommunication from './Settings-Communication'
import { runtime } from '../../runtime'
import SettingsDownloadOnDemand from './Settings-DownloadOnDemand'
import { bool, string } from 'prop-types'

const log = getLogger('renderer/dialogs/Settings')

export function flipDeltaBoolean(value: string) {
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

export type RenderDTSettingSwitchType = ({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: {
  key: keyof DesktopSettings
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) => JSX.Element | null

export type RenderDeltaSwitch2Type = ({
  key,
  label,
  description,
  disabled,
  disabledValue,
}: {
  key: string
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) => void

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
  const [value, setValue] = useState('')

  useEffect(() => {
    if (input.current) {
      input.current.disabled = true
    }
    DeltaBackend.call('settings.getConfigFor', [configKey]).then(res => {
      if (input.current) {
        setValue(res[configKey])
        input.current.disabled = false
      }
    })
  }, [configKey])

  return (
    <Label>
      {label}
      <input
        ref={input}
        style={style}
        className={Classes.INPUT}
        value={value}
        onChange={ev => {
          const value = ev.target.value
          setValue(value)
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

export interface SettingsState {
  showSettingsDialog: boolean
  settings: any
  show: string
  selfContact: todo
  rc: RC_Config
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

  const [state, _setState] = useState<SettingsState>({
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

  const { desktopSettings, setDesktopSetting } = useContext(SettingsContext)

  const tx = useTranslationFunction()

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
    if (
      (await DeltaBackend.call('settings.setConfig', key, String(value))) ===
      true
    ) {
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
  const renderDTSettingSwitch: RenderDTSettingSwitchType = ({
    key,
    label,
    description,
    disabled,
    disabledValue,
  }: {
    key: keyof DesktopSettings
    label: string
    description?: string
    disabled?: boolean
    disabledValue?: boolean
  }) => {
    if (!desktopSettings) {
      return null
    }
    const value =
      disabled === true && typeof disabledValue !== 'undefined'
        ? disabledValue
        : desktopSettings[key] === true
    return (
      <DeltaSwitch2
        label={label}
        description={description}
        value={value}
        onClick={() => {
          handleDesktopSettingsChange(key, !desktopSettings[key])
        }}
        disabled={disabled}
      />
    )
  }

  const renderDeltaSwitch = (
    configKey: string,
    label: string,
    disabled?: boolean
  ) => {
    disabled = disabled === true ? true : false

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
        disabled={disabled}
      />
    )
  }

  const renderDeltaSwitch2: RenderDeltaSwitch2Type = ({
    key,
    label,
    description,
    disabled,
    disabledValue,
  }: {
    key: string
    label: string
    description?: string
    disabled?: boolean
    disabledValue?: boolean
  }) => {
    const value =
      disabled === true && typeof disabledValue !== 'undefined'
        ? disabledValue
        : state.settings[key] === '1'
    return (
      <DeltaSwitch2
        label={label}
        value={value}
        description={description}
        onClick={() => {
          handleDeltaSettingsChange(key, flipDeltaBoolean(state.settings[key]))
        }}
        disabled={disabled}
      />
    )
  }

  const renderDialogContent = ({ settings, rc }: typeof state) => {
    if (Object.keys(settings || {}).length === 0 || !desktopSettings) {
      return null
    }

    return (
      <>
        <DeltaDialogBody>
          <SettingsProfile
            onClose={props.onClose}
            addr={settings['addr']}
            displayname={settings['displayname']}
            state={state}
            handleDeltaSettingsChange={handleDeltaSettingsChange}
          />
          <Card elevation={Elevation.ONE}>
            <SettingsCommunication
              handleDeltaSettingsChange={handleDeltaSettingsChange}
              settings={settings}
            />
            <SettingsDownloadOnDemand
              handleDeltaSettingsChange={handleDeltaSettingsChange}
              settings={settings}
            />
            <br />
            <H5>{tx('pref_privacy')}</H5>
            {renderDeltaSwitch('mdns_enabled', tx('pref_read_receipts'))}
            <br />
            <SettingsAutodelete
              handleDeltaSettingsChange={handleDeltaSettingsChange}
              settings={settings}
            />
          </Card>
          <SettingsAppearance
            handleDesktopSettingsChange={handleDesktopSettingsChange}
            rc={rc}
          />
          <SettingsEncryption renderDeltaSwitch={renderDeltaSwitch} />
          <Card elevation={Elevation.ONE}>
            <H5>{tx('pref_chats_and_media')}</H5>
            {renderDTSettingSwitch({
              key: 'enterKeySends',
              label: tx('pref_enter_sends_explain'),
            })}
            {renderDTSettingSwitch({
              key: 'notifications',
              label: tx('pref_notifications_explain'),
            })}
            {renderDTSettingSwitch({
              key: 'showNotificationContent',
              label: tx('pref_show_notification_content_explain'),
              disabled: !desktopSettings['notifications'],
            })}
          </Card>
          <Card elevation={Elevation.ONE}>
            <SettingsExperimentalFeatures
              // desktopSettings={desktopSettings}
              renderDTSettingSwitch={renderDTSettingSwitch}
              state={state}
              DeltaSettingsInput={DeltaSettingsInput}
              handleDeltaSettingsChange={handleDeltaSettingsChange}
            />
          </Card>
          <SettingsImapFolderHandling
            state={state}
            renderDeltaSwitch2={renderDeltaSwitch2}
          />
          <SettingsManageKeys />
          <SettingsBackup />
        </DeltaDialogBody>
      </>
    )
  }

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await DeltaBackend.call('settings.getConfigFor', [
        'sentbox_watch',
        'mvbox_move',
        'e2ee_enabled',
        'addr',
        'displayname',
        'selfstatus',
        'mdns_enabled',
        'show_emails',
        'bcc_self',
        'delete_device_after',
        'delete_server_after',
        'webrtc_instance',
        'download_limit',
        'only_fetch_mvbox',
      ])
      const rc = await runtime.getRC_Config()
      setState({ settings, rc })
    }
    ;(async () => {
      await loadSettings()
      const selfContact = await DeltaBackend.call(
        'contacts.getContact',
        C.DC_CONTACT_ID_SELF
      )
      setState({ selfContact })
    })()
  }, [state.show])

  useEffect(() => {
    return () => {
      ipcRenderer.removeAllListeners('DC_EVENT_IMEX_FILE_WRITTEN')
    }
  }, [])

  const { onClose } = props
  const title = tx('menu_settings')

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
      <DeltaDialogHeader
        title={title}
        onClose={onClose}
        showCloseButton={true}
      />
      {renderDialogContent(state)}
    </DeltaDialogBase>
  )
}
