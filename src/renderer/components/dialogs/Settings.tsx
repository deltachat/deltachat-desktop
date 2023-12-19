import React, { useState, useEffect, useCallback } from 'react'
import { Elevation, Card } from '@blueprintjs/core'
import { C } from '@deltachat/jsonrpc-client'

import { DesktopSettingsType } from '../../../shared/shared-types'
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
import { SendBackupDialog } from './setup_multi_device/SendBackup'
import { selectedAccountId } from '../../ScreenController'
import { BackendRemote, onDCEvent } from '../../backend-com'
import SettingsConnectivityDialog from './Settings-Connectivity'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

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
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

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
                <SettingsButtonConnectivity />
                <SettingsIconButton
                  iconName='code-tags'
                  onClick={() => setSettingsMode('advanced')}
                >
                  {tx('menu_advanced')}
                </SettingsIconButton>
                {!runtime.getRuntimeInfo().isMac && (
                  <SettingsIconButton
                    iconName='favorite'
                    onClick={() => runtime.openLink(openDialog, donationUrl)}
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

function SettingsButtonConnectivity() {
  const { openDialog } = useDialog()
  const [connectivityString, setConnectivityString] = useState('')
  const accountId = selectedAccountId()

  const updateConnectivity = useCallback(async () => {
    const connectivity = await BackendRemote.rpc.getConnectivity(accountId)

    let connectivityString = ''
    if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
      connectivityString = window.static_translate('connectivity_connected')
    } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
      connectivityString = window
        .static_translate('connectivity_updating')
        .replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
      connectivityString = window
        .static_translate('connectivity_connecting')
        .replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
      connectivityString = window.static_translate('connectivity_not_connected')
    }
    setConnectivityString(`(${connectivityString})`)
  }, [accountId])

  useEffect(() => {
    updateConnectivity()
    return onDCEvent(accountId, 'ConnectivityChanged', updateConnectivity)
  }, [updateConnectivity, accountId])

  const tx = useTranslationFunction()
  return (
    <SettingsIconButton
      iconName='swap_vert'
      onClick={() => openDialog(SettingsConnectivityDialog)}
    >
      {tx('connectivity') + ' ' + connectivityString}
    </SettingsIconButton>
  )
}
