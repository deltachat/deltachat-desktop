import React from 'react'

import type { SettingsStoreState } from '../../stores/settings'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import ShowClassicEmail from './ShowClassicEmail'
import { confirmDialog } from '../message/messageFunctions'
import useDialog from '../../hooks/dialog/useDialog'
import SettingsStoreInstance from '../../stores/settings'

type Props = {
  settingsStore: SettingsStoreState
}

export default function ImapFolderHandling({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const disableIfOnlyFetchMvBoxIsTrue =
    settingsStore.settings.only_fetch_mvbox === '1'

  const { openDialog } = useDialog()

  const showMultiDeviceWarning = async (multiDeviceActive: boolean) => {
    if (!multiDeviceActive) {
      const confirmed = await confirmDialog(
        openDialog,
        tx('pref_multidevice_change_warn'),
        tx('ok')
      )
      if (confirmed === false) {
        SettingsStoreInstance.effect.setCoreSetting('bcc_self', '1')
      }
    }
  }

  return (
    <>
      <CoreSettingsSwitch
        label={tx('pref_multidevice')}
        settingsKey='bcc_self'
        description={tx('pref_multidevice_explain')}
        callback={value => showMultiDeviceWarning(value)}
      />
      {settingsStore.settings.is_chatmail === '0' && (
        <>
          <ShowClassicEmail settingsStore={settingsStore} />
          <CoreSettingsSwitch
            label={tx('pref_auto_folder_moves')}
            settingsKey='mvbox_move'
            description={tx('pref_auto_folder_moves_explain')}
            disabled={disableIfOnlyFetchMvBoxIsTrue}
            disabledValue={false}
          />
          <CoreSettingsSwitch
            label={tx('pref_only_fetch_mvbox_title')}
            settingsKey='only_fetch_mvbox'
            description={tx('pref_only_fetch_mvbox_explain')}
          />
        </>
      )}
    </>
  )
}
