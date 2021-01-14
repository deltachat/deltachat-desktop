import React, { useContext } from 'react'
import { H5 } from '@blueprintjs/core'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SmallSelectDialog } from './DeltaDialog'
import { SettingsSelector } from './Settings'
import { C } from 'deltachat-node/dist/constants'

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

export default function SettingsCommunication(props: any) {
  const { openDialog } = useContext(ScreenContext)
  const { handleDeltaSettingsChange, settings } = props

  const tx = useTranslationFunction()
  const SHOW_EMAIL_OPTIONS = [
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
      selectedValue: String(settings['show_emails']),
      title: tx('pref_show_emails'),
      onSave: async (show: string) => {
        handleDeltaSettingsChange('show_emails', show)
      },
    })
  }

  if (!settings['show_emails']) return null

  return (
    <>
      <H5>{tx('pref_communication')}</H5>
      <SettingsSelector
        onClick={onOpenDialog.bind(this, false)}
        currentValue={showToString(settings['show_emails'])}
      >
        {tx('pref_show_emails')}
      </SettingsSelector>
    </>
  )
}
