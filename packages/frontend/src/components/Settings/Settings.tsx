import React, { useEffect } from 'react'

import { useSettingsStore } from '../../stores/settings'
import { SendBackupDialog } from '../dialogs/SetupMultiDevice'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { donationUrl } from '../../../../shared/constants'
import SettingsIconButton from './SettingsIconButton'
import ConnectivityButton from './ConnectivityButton'
import ChatsAndMedia from './ChatsAndMedia'
import Notifications from './Notifications'
import About from '../dialogs/About'
import Appearance from './Appearance'
import Advanced from './Advanced'
import Profile from './Profile'
import Dialog, { DialogBody, DialogHeader } from '../Dialog'
import EditProfileDialog from '../dialogs/EditProfileDialog'
import SettingsSeparator from './SettingsSeparator'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

export default function Settings({ onClose }: DialogProps) {
  const { openDialog } = useDialog()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const settingsStore = useSettingsStore()[0]!
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
  }, [])

  return (
    <Dialog onClose={onClose} fixed width={400} data-testid='settings-dialog'>
      <DialogHeader
        title={tx('menu_settings')}
        onClose={onClose}
        data-testid='close-settings'
      />
      <DialogBody>
        <Profile settingsStore={settingsStore} />
        <SettingsIconButton
          icon='person'
          onClick={() => openDialog(EditProfileDialog, { onClose })}
        >
          {tx('pref_edit_profile')}
        </SettingsIconButton>
        <SettingsSeparator />
        <SettingsIconButton
          icon='forum'
          onClick={() => openDialog(SettingsDialogChatsAndMedia, { onClose })}
        >
          {tx('pref_chats_and_media')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='bell'
          onClick={() => openDialog(SettingsDialogNotifications, { onClose })}
        >
          {tx('pref_notifications')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='brightness-6'
          onClick={() => openDialog(SettingsDialogAppearance, { onClose })}
        >
          {tx('pref_appearance')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='devices'
          onClick={() => openDialog(SendBackupDialog, { onClose })}
        >
          {tx('multidevice_title')}
        </SettingsIconButton>
        <ConnectivityButton />
        <SettingsIconButton
          icon='code-tags'
          onClick={() => openDialog(SettingsDialogAdvanced, { onClose })}
        >
          {tx('menu_advanced')}
        </SettingsIconButton>
        <SettingsSeparator />
        {!runtime.getRuntimeInfo().isMac && (
          <SettingsIconButton
            icon='favorite'
            onClick={() => runtime.openLink(donationUrl)}
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
          onClick={() => openDialog(About, { onClose })}
        >
          {tx('global_menu_help_about_desktop')}
        </SettingsIconButton>
      </DialogBody>
    </Dialog>
  )
}

function SettingsDialogChatsAndMedia({ onClose }: DialogProps & { x: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const settingsStore = useSettingsStore()[0]!
  const tx = useTranslationFunction()
  return (
    <Dialog onClose={onClose} fixed width={400}>
      <DialogHeader title={tx('pref_chats_and_media')} onClose={onClose} />
      <DialogBody>
        <ChatsAndMedia
          settingsStore={settingsStore}
          desktopSettings={settingsStore.desktopSettings}
        />
      </DialogBody>
    </Dialog>
  )
}

function SettingsDialogNotifications({ onClose }: DialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const settingsStore = useSettingsStore()[0]!
  const tx = useTranslationFunction()
  return (
    <Dialog onClose={onClose} fixed width={400}>
      <DialogHeader title={tx('pref_notifications')} onClose={onClose} />
      <DialogBody>
        <Notifications desktopSettings={settingsStore.desktopSettings} />
      </DialogBody>
    </Dialog>
  )
}

function SettingsDialogAppearance({ onClose }: DialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const settingsStore = useSettingsStore()[0]!
  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose} fixed width={400}>
      <DialogHeader
        onClickBack={() => {}}
        title={tx('pref_appearance')}
        onClose={onClose}
      />
      <DialogBody>
        <Appearance
          rc={settingsStore.rc}
          desktopSettings={settingsStore.desktopSettings}
          settingsStore={settingsStore}
        />
      </DialogBody>
    </Dialog>
  )
}

function SettingsDialogAdvanced({ onClose }: DialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const settingsStore = useSettingsStore()[0]!
  const tx = useTranslationFunction()
  return (
    <Dialog onClose={onClose} fixed width={400}>
      <DialogHeader title={tx('menu_advanced')} onClose={onClose} />
      <DialogBody>
        <Advanced settingsStore={settingsStore} />
      </DialogBody>
    </Dialog>
  )
}
