import React, { useState, useEffect, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import { Elevation, Card } from '@blueprintjs/core'

const { ipcRenderer } = window.electron_functions
import { SettingsContext, useTranslationFunction } from '../../contexts'

import { DesktopSettingsType, RC_Config } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import { SettingsExperimentalFeatures } from './Settings-ExperimentalFeatures'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaSwitch2,
} from './DeltaDialog'
import SettingsAppearance from './Settings-Appearance'
import SettingsProfile from './Settings-Profile'
import { getLogger } from '../../../shared/logger'
import { runtime } from '../../runtime'
import { SettingsChatsAndMedia } from './Settings-ChatsAndMedia'
import { SettingsAdvanced } from './Settings-Advanced'
import SettingsNotifications from './Settings-Notifications'

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

export function SettingsIconButton(props: any) {
  const { onClick, iconName, children, ...otherProps } = props
  return (
    <div className='SettingsIconButton' onClick={onClick}>
      <div
        className='Icon'
        style={{
          WebkitMask: 'url(../images/' + iconName + '.svg) no-repeat center',
        }}
      ></div>
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
  key: keyof DesktopSettingsType
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
  const [settingsMode, setSettingsMode] = useState('main')

  /*
   * Saves settings for the Deltachat Desktop
   * persisted in ~/.config/DeltaChat/deltachat.json
   */
  const handleDesktopSettingsChange = async (
    key: keyof DesktopSettingsType,
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
    key: keyof DesktopSettingsType
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
        {settingsMode === 'main' && (
          <>
            <DeltaDialogHeader
              title={tx('menu_settings')}
              onClose={onClose}
              showCloseButton={true}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
                <SettingsProfile
                  onClose={props.onClose}
                  addr={settings['addr']}
                  displayname={settings['displayname']}
                  state={state}
                  handleDeltaSettingsChange={handleDeltaSettingsChange}
                />
                <br />
                <SettingsIconButton
                  iconName='forum'
                  onClick={() => setSettingsMode('chats_and_media')}
                >
                  {tx('pref_chats_and_media')}
                </SettingsIconButton>
                <SettingsIconButton
                  iconName='bell'
                  onClick={() => setSettingsMode('notifications')}
                >
                  {tx('pref_notifications')}
                </SettingsIconButton>
                <SettingsIconButton
                  iconName='brightness-6'
                  onClick={() => setSettingsMode('appearance')}
                >
                  {tx('pref_appearance')}
                </SettingsIconButton>
                <SettingsIconButton
                  iconName='code-tags'
                  onClick={() => setSettingsMode('advanced')}
                >
                  {tx('menu_advanced')}
                </SettingsIconButton>
                <SettingsIconButton
                  iconName='test-tube'
                  onClick={() => setSettingsMode('experimental_features')}
                >
                  {tx('pref_experimental_features')}
                </SettingsIconButton>
              </Card>
            </DeltaDialogBody>
          </>
        )}
        {settingsMode === 'experimental_features' && (
          <>
            <DeltaDialogHeader
              title={tx('pref_experimental_features')}
              showBackButton={true}
              onClickBack={() => setSettingsMode('main')}
              showCloseButton={true}
              onClose={onClose}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE}>
                <SettingsExperimentalFeatures
                  renderDTSettingSwitch={renderDTSettingSwitch}
                  state={state}
                  handleDeltaSettingsChange={handleDeltaSettingsChange}
                  handleDesktopSettingsChange={handleDesktopSettingsChange}
                />
              </Card>
            </DeltaDialogBody>
          </>
        )}
        {settingsMode === 'chats_and_media' && (
          <>
            <DeltaDialogHeader
              title={tx('pref_chats_and_media')}
              showBackButton={true}
              onClickBack={() => setSettingsMode('main')}
              showCloseButton={true}
              onClose={onClose}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE}>
                <SettingsChatsAndMedia
                  state={state}
                  handleDeltaSettingsChange={handleDeltaSettingsChange}
                  renderDeltaSwitch2={renderDeltaSwitch2}
                  renderDTSettingSwitch={renderDTSettingSwitch}
                />
              </Card>
            </DeltaDialogBody>
          </>
        )}
        {settingsMode === 'notifications' && (
          <>
            <DeltaDialogHeader
              title={tx('pref_notifications')}
              showBackButton={true}
              onClickBack={() => setSettingsMode('main')}
              showCloseButton={true}
              onClose={onClose}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE}>
                <SettingsNotifications
                  desktopSettings={desktopSettings}
                  renderDTSettingSwitch={renderDTSettingSwitch}
                />
              </Card>
            </DeltaDialogBody>
          </>
        )}
        {settingsMode === 'appearance' && (
          <>
            <DeltaDialogHeader
              title={tx('pref_appearance')}
              showBackButton={true}
              onClickBack={() => setSettingsMode('main')}
              showCloseButton={true}
              onClose={onClose}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE}>
                <SettingsAppearance
                  handleDesktopSettingsChange={handleDesktopSettingsChange}
                  rc={rc}
                />
              </Card>
            </DeltaDialogBody>
          </>
        )}
        {settingsMode === 'advanced' && (
          <>
            <DeltaDialogHeader
              title={tx('menu_advanced')}
              showBackButton={true}
              onClickBack={() => setSettingsMode('main')}
              showCloseButton={true}
              onClose={onClose}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE}>
                <SettingsAdvanced
                  state={state}
                  renderDeltaSwitch2={renderDeltaSwitch2}
                />
              </Card>
            </DeltaDialogBody>
          </>
        )}
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
      {renderDialogContent(state)}
    </DeltaDialogBase>
  )
}
