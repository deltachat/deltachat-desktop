import React from 'react'

import { SettingsStoreState } from '../../stores/settings'
import OutgoingMediaQuality from './OutgoingMediaQuality'
import DownloadOnDemand from './DownloadOnDemand'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import Autodelete from './Autodelete'
import Backup from './Backup'
import SettingsSeparator from './SettingsSeparator'
import SettingsHeading from './SettingsHeading'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import UnblockContacts from '../dialogs/UnblockContacts'
import SettingsButton from './SettingsButton'

type Props = {
  settingsStore: SettingsStoreState
}

export default function ChatsAndMedia({ settingsStore }: Props) {
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
      <DesktopSettingsSwitch
        settingsKey='enterKeySends'
        label={tx('pref_enter_sends')}
        description={tx('pref_enter_sends_explain')}
      />
      <OutgoingMediaQuality settings={settingsStore.settings} />
      <DownloadOnDemand settings={settingsStore.settings} />

      <SettingsSeparator />
      <SettingsHeading>{tx('delete_old_messages')}</SettingsHeading>
      <Autodelete settingsStore={settingsStore} />
      <SettingsSeparator />
      <SettingsHeading>{tx('pref_backup')}</SettingsHeading>
      <Backup />
    </>
  )
}
