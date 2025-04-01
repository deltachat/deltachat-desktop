import React, { useCallback } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import SettingsStoreInstance, {
  type SettingsStoreState,
} from '../../stores/settings'
import SettingsSelector from './SettingsSelector'
import SmallSelectDialog, {
  type SelectDialogOption,
} from '../SmallSelectDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

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

type Props = {
  settingsStore: SettingsStoreState
}

export default function ShowClassicEmail({ settingsStore }: Props) {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  const onOpenDialog = useCallback(() => {
    const values: SelectDialogOption[] = [
      [String(C.DC_SHOW_EMAILS_OFF), tx('pref_show_emails_no')],
      [
        String(C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS),
        tx('pref_show_emails_accepted_contacts'),
      ],
      [String(C.DC_SHOW_EMAILS_ALL), tx('pref_show_emails_all')],
    ]

    openDialog(SmallSelectDialog, {
      values,
      initialSelectedValue: String(settingsStore.settings['show_emails']),
      title: tx('pref_show_emails'),
      onSave: (show: string) => {
        SettingsStoreInstance.effect.setCoreSetting('show_emails', show)
      },
    })
  }, [openDialog, settingsStore.settings, tx])

  if (!settingsStore.settings['show_emails']) return null

  return (
    <>
      <SettingsSelector
        onClick={onOpenDialog.bind(null)}
        currentValue={showToString(settingsStore.settings['show_emails'])}
      >
        {tx('pref_show_emails')}
      </SettingsSelector>
    </>
  )
}
