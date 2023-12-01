import { H5 } from '@blueprintjs/core'
import React from 'react'

import { SettingsStoreState } from '../../stores/settings'
import Encryption from './Encryption'
import { useTranslationFunction } from '../../contexts'
import { ExperimentalFeatures } from './ExperimentalFeatures'
import ImapFolderHandling from './ImapFolderHandling'
import ManageKeys from './ManageKeys'

type Props = {
  settingsStore: SettingsStoreState
}

export default function Advanced({ settingsStore }: Props) {
  const tx = useTranslationFunction()

  return (
    <>
      <Encryption />
      <br />
      <br />
      <ImapFolderHandling settingsStore={settingsStore} />
      <br />
      <br />
      <ManageKeys />
      <br />
      <br />
      <H5>{tx('pref_experimental_features')}</H5>
      <ExperimentalFeatures settingsStore={settingsStore} />
    </>
  )
}
