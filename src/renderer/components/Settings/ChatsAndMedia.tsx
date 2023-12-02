import React from 'react'

import {
  enterKeySendsKeyboardShortcuts,
  KeybordShortcutHintInSettings,
} from '../KeyboardShortcutHint'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { SettingsStoreState } from '../../stores/settings'
import { useTranslationFunction } from '../../contexts'
import Communication from './Communication'
import OutgoingMediaQuality from './OutgoingMediaQuality'
import DownloadOnDemand from './DownloadOnDemand'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import Autodelete from './Autodelete'
import Backup from './Backup'
import SettingsSeparator from './SettingsSeparator'
import SettingsHeading from './SettingsHeading'
import { DialogContent } from '../Dialog'

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
