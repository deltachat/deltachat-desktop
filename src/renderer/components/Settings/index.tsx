import React, { useState, useEffect, useContext } from 'react'
import { Elevation, Card } from '@blueprintjs/core'

import { DesktopSettingsType } from '../../../shared/shared-types'
import SettingsStoreInstance, {
  SettingsStoreState,
  useSettingsStore,
} from '../../stores/settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogHeader,
  DeltaSwitch2,
} from '../dialogs/DeltaDialog'
import SettingsProfile from '../dialogs/Settings-Profile'
import { SendBackupDialog } from '../dialogs/setup_multi_device/SendBackup'
import { runtime } from '../../runtime'
import { DialogProps } from '../dialogs/DialogController'
import { donationUrl } from '../../../shared/constants'
import { SettingsChatsAndMedia } from '../dialogs/Settings-ChatsAndMedia'
import SettingsNotifications from '../dialogs/Settings-Notifications'
import SettingsAppearance from '../dialogs/Settings-Appearance'
import { SettingsAdvanced } from '../dialogs/Settings-Advanced'
import SettingsIconButton from './SettingsIconButton'
import SettingsConnectivityButton from './SettingsConnectivityButton'

export function flipDeltaBoolean(value: string) {
  return value === '1' ? '0' : '1'
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
  key: keyof SettingsStoreState['settings']
  label: string
  description?: string
  disabled?: boolean
  disabledValue?: boolean
}) => void

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

  const { onClose } = props
  const settingsStore = useSettingsStore()[0]

  const { openDialog } = useContext(ScreenContext)

  const tx = useTranslationFunction()
  const [settingsMode, setSettingsMode] = useState('main')

  /*
   * render switch for Desktop Settings
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
    if (!settingsStore) {
      return null
    }
    const value =
      disabled === true && typeof disabledValue !== 'undefined'
        ? disabledValue
        : settingsStore.desktopSettings[key] === true
    return (
      <DeltaSwitch2
        label={label}
        description={description}
        value={value}
        onClick={() => {
          SettingsStoreInstance.effect.setDesktopSetting(
            key,
            !settingsStore.desktopSettings[key]
          )
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
    key: keyof SettingsStoreState['settings']
    label: string
    description?: string
    disabled?: boolean
    disabledValue?: boolean
  }) => {
    if (!settingsStore) return
    const value =
      disabled === true && typeof disabledValue !== 'undefined'
        ? disabledValue
        : settingsStore.settings[key] === '1'
    return (
      <DeltaSwitch2
        label={label}
        value={value}
        description={description}
        onClick={() => {
          SettingsStoreInstance.effect.setCoreSetting(
            key,
            flipDeltaBoolean(settingsStore.settings[key])
          )
        }}
        disabled={disabled}
      />
    )
  }

  const renderDialogContent = () => {
    if (!settingsStore) return null

    if (
      Object.keys(settingsStore.settings || {}).length === 0 ||
      !settingsStore.desktopSettings
    ) {
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
                  settingsStore={settingsStore}
                  onClose={props.onClose}
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
                  iconName='devices'
                  onClick={() => {
                    openDialog(SendBackupDialog)
                    props.onClose()
                  }}
                >
                  {tx('multidevice_title')}
                </SettingsIconButton>
                <SettingsConnectivityButton />
                <SettingsIconButton
                  iconName='code-tags'
                  onClick={() => setSettingsMode('advanced')}
                >
                  {tx('menu_advanced')}
                </SettingsIconButton>
                {!runtime.getRuntimeInfo().isMac && (
                  <SettingsIconButton
                    iconName='favorite'
                    onClick={() => runtime.openLink(donationUrl)}
                    isLink
                  >
                    {tx('donate')}
                  </SettingsIconButton>
                )}
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
                  settingsStore={settingsStore}
                  desktopSettings={settingsStore.desktopSettings}
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
                  desktopSettings={settingsStore.desktopSettings}
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
                  rc={settingsStore.rc}
                  desktopSettings={settingsStore.desktopSettings}
                  settingsStore={settingsStore}
                  renderDTSettingSwitch={renderDTSettingSwitch}
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
                  settingsStore={settingsStore}
                  renderDeltaSwitch2={renderDeltaSwitch2}
                  renderDTSettingSwitch={renderDTSettingSwitch}
                />
              </Card>
            </DeltaDialogBody>
          </>
        )}
      </>
    )
  }

  return (
    <DeltaDialogBase
      isOpen={props.isOpen}
      onClose={() => {
        props.onClose()
      }}
      className='SettingsDialog'
      fixed
    >
      {renderDialogContent()}
    </DeltaDialogBase>
  )
}
