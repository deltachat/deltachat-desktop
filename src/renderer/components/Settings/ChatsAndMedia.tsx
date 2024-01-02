import React from 'react'

import Autodelete from './Autodelete'
import Backup from './Backup'
import Communication from './Communication'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import DownloadOnDemand from './DownloadOnDemand'
import OutgoingMediaQuality from './OutgoingMediaQuality'
import SettingsHeading from './SettingsHeading'
import SettingsSeparator from './SettingsSeparator'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { DialogContent } from '../Dialog'
import {
  enterKeySendsKeyboardShortcuts,
  KeybordShortcutHintInSettings,
} from '../KeyboardShortcutHint'

import type { DesktopSettingsType } from '../../../shared/shared-types'
import type { SettingsStoreState } from '../../stores/settings'

type Props = {
  settingsStore: SettingsStoreState
  desktopSettings: DesktopSettingsType
}

export default function ChatsAndMedia({
  settingsStore,
  desktopSettings,
}: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <SettingsHeading>{tx('pref_chats')}</SettingsHeading>
      <Communication settingsStore={settingsStore} />
      <OutgoingMediaQuality settings={settingsStore.settings} />
      <DownloadOnDemand settings={settingsStore.settings} />
      <DesktopSettingsSwitch
        settingsKey='enterKeySends'
        label={tx('pref_enter_sends_explain')}
      />
      <DialogContent>
        <KeybordShortcutHintInSettings
          actions={enterKeySendsKeyboardShortcuts(
            desktopSettings['enterKeySends']
          )}
        />
      </DialogContent>
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_privacy')}</SettingsHeading>
      <CoreSettingsSwitch
        settingsKey='mdns_enabled'
        label={tx('pref_read_receipts')}
      />
      <SettingsSeparator />
      <SettingsHeading>{tx('delete_old_messages')}</SettingsHeading>
      <Autodelete settingsStore={settingsStore} />
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_backup')}</SettingsHeading>
      <Backup />
    </>
  )
}
