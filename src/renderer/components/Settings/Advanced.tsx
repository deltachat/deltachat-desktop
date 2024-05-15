import React from 'react'

import { SettingsStoreState } from '../../stores/settings'
import Encryption from './Encryption'
import { ExperimentalFeatures } from './ExperimentalFeatures'
import ImapFolderHandling from './ImapFolderHandling'
import SettingsHeading from './SettingsHeading'
import SettingsSeparator from './SettingsSeparator'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import Communication from './Communication'
import EditAccountAndPasswordDialog from '../dialogs/EditAccountAndPasswordDialog'
import useDialog from '../../hooks/dialog/useDialog'
import SettingsButton from './SettingsButton'

type Props = {
  settingsStore: SettingsStoreState
}

export default function Advanced({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  return (
    <>
      <Communication settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_experimental_features')}</SettingsHeading>
      <ExperimentalFeatures settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_encryption')}</SettingsHeading>
      <Encryption settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_server')}</SettingsHeading>
      <SettingsButton
        onClick={() => {
          openDialog(EditAccountAndPasswordDialog, {
            settingsStore,
          })
        }}
      >
        {tx('pref_password_and_account_settings')}
      </SettingsButton>
      {!settingsStore.settings.is_chatmail && (
        <ImapFolderHandling settingsStore={settingsStore} />
      )}
    </>
  )
}
