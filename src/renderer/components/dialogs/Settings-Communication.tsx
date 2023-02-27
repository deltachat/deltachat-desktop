import React, { useContext } from 'react'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SmallSelectDialog, SelectDialogOption } from './DeltaDialog'
import { SettingsSelector } from './Settings'
import { C } from '@deltachat/jsonrpc-client'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'

function showToString(configValue: number | string) {
  if (typeof configValue === 'string') configValue = Number(configValue)
  const tx = window.static_translate
  switch (configValue) {
    case C.DC_SHOW_EMAILS_OFF:
      return tx('pref_show_emails_no')
    case C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS:
      return tx('pref_show_emails_accepted_contacts')
    case C.DC_SHOW_EMAILS_ALL:
      return tx('pref_show_emails_all')
    default:
      throw new Error('Invalid config value')
  }
}

export default function SettingsCommunication({
  settingsStore,
}: {
  settingsStore: SettingsStoreState
}) {
  const { openDialog } = useContext(ScreenContext)

  const tx = useTranslationFunction()
  const SHOW_EMAIL_OPTIONS: SelectDialogOption[] = [
    [String(C.DC_SHOW_EMAILS_OFF), tx('pref_show_emails_no')],
    [
      String(C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS),
      tx('pref_show_emails_accepted_contacts'),
    ],
    [String(C.DC_SHOW_EMAILS_ALL), tx('pref_show_emails_all')],
  ]

  const onOpenDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: SHOW_EMAIL_OPTIONS,
      selectedValue: String(settingsStore.settings['show_emails']),
      title: tx('pref_show_emails'),
      onSave: async (show: string) => {
        SettingsStoreInstance.effect.setCoreSetting('show_emails', show)
      },
    })
  }

  if (!settingsStore.settings['show_emails']) return null

  return (
    <>
      <h5 className='heading'>{tx('pref_chats')}</h5>
      <SettingsSelector
        onClick={onOpenDialog.bind(null, false)}
        currentValue={showToString(settingsStore.settings['show_emails'])}
      >
        {tx('pref_show_emails')}
      </SettingsSelector>
    </>
  )
}
