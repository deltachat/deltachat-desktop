import React from 'react'
import { H5 } from '@blueprintjs/core'

import SettingsAutodelete from './Settings-Autodelete'
import SettingsBackup from './Settings-Backup'
import SettingsCommunication from './Settings-Communication'
import SettingsDownloadOnDemand from './Settings-DownloadOnDemand'
import {
  enterKeySendsKeyboardShortcuts,
  KeybordShortcutHintInSettings,
} from '../KeyboardShortcutHint'
import { DesktopSettingsType } from '../../../shared/shared-types'
import { SettingsStoreState } from '../../stores/settings'
import SettingsOutgoingMediaQuality from './Settings-OutgoingMediaQuality'
import { CoreSettingsSwitch, DesktopSettingsSwitch } from '../SettingsSwitch'
import { useTranslationFunction } from '../../contexts'

type Props = {
  settingsStore: SettingsStoreState
  desktopSettings: DesktopSettingsType
}

export function SettingsChatsAndMedia({
  settingsStore,
  desktopSettings,
}: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <SettingsCommunication settingsStore={settingsStore} />
      <SettingsOutgoingMediaQuality settings={settingsStore.settings} />
      <SettingsDownloadOnDemand settings={settingsStore.settings} />
      <DesktopSettingsSwitch
        key='enterKeySends'
        label={tx('pref_enter_sends_explain')}
      />
      <KeybordShortcutHintInSettings
        actions={enterKeySendsKeyboardShortcuts(
          desktopSettings['enterKeySends']
        )}
      />
      <br />
      <br />
      <H5>{tx('pref_privacy')}</H5>
      <CoreSettingsSwitch key='mdns_enabled' label={tx('pref_read_receipts')} />
      <br />
      <br />
      <SettingsAutodelete settingsStore={settingsStore} />
      <br />
      <br />
      <SettingsBackup />
    </>
  )
}
