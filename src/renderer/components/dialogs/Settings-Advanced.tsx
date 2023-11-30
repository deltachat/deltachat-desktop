import { H5 } from '@blueprintjs/core'
import React from 'react'

import { SettingsStoreState } from '../../stores/settings'
import SettingsEncryption from './Settings-Encryption'
import { SettingsExperimentalFeatures } from './SettingsExperimentalFeatures'
import SettingsImapFolderHandling from './Settings-ImapFolderHandling'
import SettingsManageKeys from './Settings-ManageKeys'
import { useTranslationFunction } from '../../contexts'

type Props = {
  settingsStore: SettingsStoreState
}

export function SettingsAdvanced({ settingsStore }: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <SettingsEncryption />
      <br />
      <br />
      <SettingsImapFolderHandling settingsStore={settingsStore} />
      <br />
      <br />
      <SettingsManageKeys />
      <br />
      <br />
      <H5>{tx('pref_experimental_features')}</H5>
      <SettingsExperimentalFeatures settingsStore={settingsStore} />
    </>
  )
}
