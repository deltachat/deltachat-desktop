import React, { useState, useEffect } from 'react'
import { Elevation, Card } from '@blueprintjs/core'

import { useTranslationFunction } from '../../contexts'

import { DesktopSettingsType } from '../../../shared/shared-types'
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
import { SettingsChatsAndMedia } from './Settings-ChatsAndMedia'
import { SettingsAdvanced } from './Settings-Advanced'
import SettingsNotifications from './Settings-Notifications'
import SettingsStoreInstance, {
  SettingsStoreState,
  useSettingsStore,
} from '../../stores/settings'
import { runtime } from '../../runtime'
import { donationUrl } from '../../../shared/constants'
import { SettingsDonate } from './Settings-Donate'

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
  const { onClick, iconName, children, isLink, ...otherProps } = props
  return (
    <div className='SettingsIconButton' onClick={onClick}>
      <div
        className='Icon'
        style={{
          WebkitMask:
            'url(../images/icons/' + iconName + '.svg) no-repeat center',
        }}
      ></div>
      <button {...otherProps}>{children}</button>
      {isLink && (
        <div
          className='Icon'
          style={{
            WebkitMask: 'url(../images/icons/open_in_new.svg) no-repeat center',
          }}
        ></div>
      )}
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

  const settingsStore = useSettingsStore()[0]

  const tx = useTranslationFunction()
  const [settingsMode, setSettingsMode] = useState('main')

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
                {!runtime.getRuntimeInfo().isMac && (
                  <SettingsIconButton
                    iconName='favorite'
                    onClick={() => runtime.openLink(donationUrl)}
                    isLink
                  >
                    {tx('pref_donate')}
                  </SettingsIconButton>
                )}
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
                  settingsStore={settingsStore}
                  renderDTSettingSwitch={renderDTSettingSwitch}
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
        {settingsMode === 'donation' && (
          <>
            <DeltaDialogHeader
              title={tx('contribute_to_deltachat')}
              showBackButton={true}
              onClickBack={() => setSettingsMode('main')}
              showCloseButton={true}
              onClose={onClose}
            />
            <DeltaDialogBody>
              <Card elevation={Elevation.ONE}>
                <SettingsDonate />
              </Card>
            </DeltaDialogBody>
          </>
        )}
      </>
    )
  }

  const { onClose } = props

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
