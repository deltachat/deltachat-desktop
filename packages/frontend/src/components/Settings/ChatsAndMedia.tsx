import React from 'react'

import {
  enterKeySendsKeyboardShortcuts,
  KeybordShortcutHintInSettings,
} from '../KeyboardShortcutHint'
import OutgoingMediaQuality from './OutgoingMediaQuality'
import DownloadOnDemand from './DownloadOnDemand'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import Backup from './Backup'
import SettingsSeparator from './SettingsSeparator'
import SettingsHeading from './SettingsHeading'
import { DialogContent } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DesktopSettingsType } from '../../../../shared/shared-types'
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
      <OutgoingMediaQuality settings={settingsStore.settings} />
      <DownloadOnDemand settings={settingsStore.settings} />
      <DesktopSettingsSwitch
        settingsKey='enterKeySends'
        label={tx('pref_enter_sends')}
        description={tx('pref_enter_sends_explain')}
      />
      <DialogContent>
        <KeybordShortcutHintInSettings
          actions={enterKeySendsKeyboardShortcuts(
            desktopSettings['enterKeySends']
          )}
        />
      </DialogContent>
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_backup')}</SettingsHeading>
      <Backup />
    </>
  )
}
