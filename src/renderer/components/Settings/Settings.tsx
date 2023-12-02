import React, { useState, useEffect, useContext } from 'react'

import { useSettingsStore } from '../../stores/settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SendBackupDialog } from '../dialogs/SetupMultiDevice'
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
import Dialog, { DialogBody, DialogHeader } from '../Dialog'
import EditProfileDialog from '../dialogs/EditProfileDialog'
import EditAccountAndPasswordDialog from '../dialogs/EditAccountAndPasswordDialog'
import SettingsSeparator from './SettingsSeparator'

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
    <Dialog isOpen={isOpen} onClose={onClose} fixed>
      {settingsMode === 'main' && (
        <>
          <DialogHeader title={tx('menu_settings')} onClose={onClose} />
          <DialogBody>
            <Profile settingsStore={settingsStore} />
            <SettingsIconButton
              iconName='user'
              onClick={() => {
                openDialog(EditProfileDialog, {
                  settingsStore,
                })
              }}
            >
              {tx('pref_edit_profile')}
            </SettingsIconButton>
            <SettingsIconButton
              iconName='lock'
              onClick={() => {
                openDialog(EditAccountAndPasswordDialog, {
                  settingsStore,
                })
              }}
            >
              {tx('pref_password_and_account_settings')}
            </SettingsIconButton>
            <SettingsSeparator />
            <SettingsIconButton
              iconPath='../images/icons/forum.svg'
              onClick={() => setSettingsMode('chats_and_media')}
            >
              {tx('pref_chats_and_media')}
            </SettingsIconButton>
            <SettingsIconButton
              iconPath='../images/icons/bell.svg'
              onClick={() => setSettingsMode('notifications')}
            >
              {tx('pref_notifications')}
            </SettingsIconButton>
            <SettingsIconButton
              iconPath='../images/icons/brightness-6.svg'
              onClick={() => setSettingsMode('appearance')}
            >
              {tx('pref_appearance')}
            </SettingsIconButton>
            <SettingsIconButton
              iconPath='../images/icons/devices.svg'
              onClick={() => {
                openDialog(SendBackupDialog)
                onClose()
              }}
            >
              {tx('multidevice_title')}
            </SettingsIconButton>
            <ConnectivityButton />
            <SettingsIconButton
              iconPath='../images/icons/code-tags.svg'
              onClick={() => setSettingsMode('advanced')}
            >
              {tx('menu_advanced')}
            </SettingsIconButton>
            {!runtime.getRuntimeInfo().isMac && (
              <SettingsIconButton
                iconPath='../images/icons/favorite.svg'
                onClick={() => runtime.openLink(donationUrl)}
                isLink
              >
                {tx('donate')}
              </SettingsIconButton>
            )}
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
            <ChatsAndMedia
              settingsStore={settingsStore}
              desktopSettings={settingsStore.desktopSettings}
            />
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
            <Notifications desktopSettings={settingsStore.desktopSettings} />
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
            <Appearance
              rc={settingsStore.rc}
              desktopSettings={settingsStore.desktopSettings}
              settingsStore={settingsStore}
            />
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
            <Advanced settingsStore={settingsStore} />
          </DialogBody>
        </>
      )}
    </Dialog>
  )
}
