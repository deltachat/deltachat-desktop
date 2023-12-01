import React, { useState, useEffect, useContext } from 'react'
import { Elevation, Card } from '@blueprintjs/core'

import { useSettingsStore } from '../../stores/settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SendBackupDialog } from '../dialogs/setup_multi_device/SendBackup'
import { runtime } from '../../runtime'
import { DialogProps } from '../dialogs/DialogController'
import { donationUrl } from '../../../shared/constants'
import SettingsIconButton from './SettingsIconButton'
import ConnectivityButton from './ConnectivityButton'
import ChatsAndMedia from './ChatsAndMedia'
import Notifications from './Notifications'
import Appearance from './Appearance'
import Advanced from './Advanced'
import Profile from './Profile'

import styles from './styles.module.scss'
import Dialog, { DialogBody, DialogHeader } from '../Dialog'

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
    <Dialog isOpen={isOpen} onClose={onClose} className={styles.settings} fixed>
      {settingsMode === 'main' && (
        <>
          <DialogHeader title={tx('menu_settings')} onClose={onClose} />
          <DialogBody>
            <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
              <Profile settingsStore={settingsStore} onClose={onClose} />
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
              <ConnectivityButton />
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
          </DialogBody>
        </>
      )}
      {settingsMode === 'chats_and_media' && (
        <>
          <DialogHeader
            title={tx('pref_chats_and_media')}
            onClickBack={() => setSettingsMode('main')}
            onClose={onClose}
          />
          <DialogBody>
            <Card elevation={Elevation.ONE}>
              <ChatsAndMedia
                settingsStore={settingsStore}
                desktopSettings={settingsStore.desktopSettings}
              />
            </Card>
          </DialogBody>
        </>
      )}
      {settingsMode === 'notifications' && (
        <>
          <DialogHeader
            title={tx('pref_notifications')}
            onClickBack={() => setSettingsMode('main')}
            onClose={onClose}
          />
          <DialogBody>
            <Card elevation={Elevation.ONE}>
              <Notifications desktopSettings={settingsStore.desktopSettings} />
            </Card>
          </DialogBody>
        </>
      )}
      {settingsMode === 'appearance' && (
        <>
          <DialogHeader
            title={tx('pref_appearance')}
            onClickBack={() => setSettingsMode('main')}
            onClose={onClose}
          />
          <DialogBody>
            <Card elevation={Elevation.ONE}>
              <Appearance
                rc={settingsStore.rc}
                desktopSettings={settingsStore.desktopSettings}
                settingsStore={settingsStore}
              />
            </Card>
          </DialogBody>
        </>
      )}
      {settingsMode === 'advanced' && (
        <>
          <DialogHeader
            title={tx('menu_advanced')}
            onClickBack={() => setSettingsMode('main')}
            onClose={onClose}
          />
          <DialogBody>
            <Card elevation={Elevation.ONE}>
              <Advanced settingsStore={settingsStore} />
            </Card>
          </DialogBody>
        </>
      )}
    </Dialog>
  )
}
