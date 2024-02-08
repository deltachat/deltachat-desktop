import React, { useState, useEffect } from 'react'

import { useSettingsStore } from '../../stores/settings'
import { SendBackupDialog } from '../dialogs/SetupMultiDevice'
import { runtime } from '../../runtime'
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
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import About from '../dialogs/About'

type SettingsView =
  | 'main'
  | 'chats_and_media'
  | 'notifications'
  | 'appearance'
  | 'advanced'

export default function Settings({ onClose }: DialogProps) {
  const { openDialog } = useDialog()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    <Dialog onClose={onClose} fixed width={400}>
      {settingsMode === 'main' && (
        <>
          <DialogHeader title={tx('menu_settings')} onClose={onClose} />
          <DialogBody>
            <Profile settingsStore={settingsStore} />
            <SettingsIconButton
              icon='person'
              onClick={() => {
                openDialog(EditProfileDialog, {
                  settingsStore,
                })
              }}
            >
              {tx('pref_edit_profile')}
            </SettingsIconButton>
            <SettingsIconButton
              icon='list'
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
              icon='forum'
              onClick={() => setSettingsMode('chats_and_media')}
            >
              {tx('pref_chats_and_media')}
            </SettingsIconButton>
            <SettingsIconButton
              icon='bell'
              onClick={() => setSettingsMode('notifications')}
            >
              {tx('pref_notifications')}
            </SettingsIconButton>
            <SettingsIconButton
              icon='brightness-6'
              onClick={() => setSettingsMode('appearance')}
            >
              {tx('pref_appearance')}
            </SettingsIconButton>
            <SettingsIconButton
              icon='devices'
              onClick={() => {
                openDialog(SendBackupDialog)
                onClose()
              }}
            >
              {tx('multidevice_title')}
            </SettingsIconButton>
            <ConnectivityButton />
            <SettingsIconButton
              icon='code-tags'
              onClick={() => setSettingsMode('advanced')}
            >
              {tx('menu_advanced')}
            </SettingsIconButton>
            <SettingsSeparator />
            {!runtime.getRuntimeInfo().isMac && (
              <SettingsIconButton
                icon='favorite'
                onClick={() => runtime.openLink(openDialog, donationUrl)}
                isLink
              >
                {tx('donate')}
              </SettingsIconButton>
            )}
            <SettingsIconButton
              icon='question_mark'
              onClick={() => runtime.openHelpWindow()}
            >
              {tx('menu_help')}
            </SettingsIconButton>
            <SettingsIconButton
              icon='info'
              onClick={() => openDialog(About)}
            >
              {tx('global_menu_help_about_desktop')}
            </SettingsIconButton>
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
