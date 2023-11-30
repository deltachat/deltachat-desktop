import React, { useState, useEffect, useContext } from 'react'
import { Elevation, Card } from '@blueprintjs/core'

import { useSettingsStore } from '../../stores/settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogHeader,
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

import styles from './styles.module.scss'

type SettingsView =
  | 'main'
  | 'chats_and_media'
  | 'notifications'
  | 'appearance'
  | 'advanced'

export default function Settings({ isOpen, onClose }: DialogProps) {
  const { openDialog } = useContext(ScreenContext)
  const settingsStore = useSettingsStore()[0]!
  const tx = useTranslationFunction()
  const [settingsMode, setSettingsMode] = useState<SettingsView>('main')

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
  }, [])

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      className={styles.settings}
      fixed
    >
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
                onClose={onClose}
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
                  onClose()
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
              <SettingsAdvanced settingsStore={settingsStore} />
            </Card>
          </DeltaDialogBody>
        </>
      )}
    </DeltaDialogBase>
  )
}
