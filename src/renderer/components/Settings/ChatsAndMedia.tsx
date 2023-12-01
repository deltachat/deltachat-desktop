import React from 'react'
import { H5 } from '@blueprintjs/core'

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
      <Communication settingsStore={settingsStore} />
      <OutgoingMediaQuality settings={settingsStore.settings} />
      <DownloadOnDemand settings={settingsStore.settings} />
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
      <Autodelete settingsStore={settingsStore} />
      <br />
      <br />
      <Backup />
    </>
  )
}
