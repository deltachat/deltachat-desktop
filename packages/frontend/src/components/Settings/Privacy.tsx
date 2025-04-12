import React from 'react'

import CoreSettingsSwitch from './CoreSettingsSwitch'
import Autodelete from './Autodelete'
import SettingsSeparator from './SettingsSeparator'
import SettingsHeading from './SettingsHeading'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import UnblockContacts from '../dialogs/UnblockContacts'
import SettingsButton from './SettingsButton'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import { runtime } from '@deltachat-desktop/runtime-interface'

import type { DesktopSettingsType } from '../../../../shared/shared-types'
import type { SettingsStoreState } from '../../stores/settings'

type Props = {
  settingsStore: SettingsStoreState
  desktopSettings: DesktopSettingsType
}

export default function Privacy({ settingsStore, desktopSettings }: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  return (
    <>
      <SettingsButton onClick={() => openDialog(UnblockContacts)}>
        {tx('pref_blocked_contacts')}
      </SettingsButton>
      <CoreSettingsSwitch
        settingsKey='mdns_enabled'
        label={tx('pref_read_receipts')}
        description={tx('pref_read_receipts_explain')}
      />
      {runtime.getRuntimeInfo().isContentProtectionSupported && (
        <DesktopSettingsSwitch
          settingsKey='contentProtectionEnabled'
          label={tx('pref_screen_security')}
          description={tx('pref_screen_security_explain')}
        />
      )}
      <SettingsSeparator />
      <SettingsHeading>{tx('delete_old_messages')}</SettingsHeading>
      <Autodelete settingsStore={settingsStore} />
    </>
  )
}
