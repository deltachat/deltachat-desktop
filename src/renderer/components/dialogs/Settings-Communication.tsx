import React, { useContext, useState } from 'react'
import { H5 } from '@blueprintjs/core'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
  DeltaDialogHeader,
  SmallDialog,
  SmallSelectDialog,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import { DeltaBackend } from '../../delta-remote'
import { SettingsSelector } from './Settings'
import { AutodeleteDuration } from '../../../shared/constants'
import { DeltaCheckbox } from '../contact/ContactListItem'
import classNames from 'classnames'
import { C } from 'deltachat-node'

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
  const AUTODELETE_DURATION_OPTIONS = [
    [String(C.DC_SHOW_EMAILS_OFF), tx('pref_show_emails_no')],
    [String(C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS), tx('pref_show_emails_accepted_contacts')],
    [String(C.DC_SHOW_EMAILS_ALL), tx('pref_show_emails_all')]
  ]

  const onOpenDialog = async (fromServer: boolean) => {
    openDialog(SmallSelectDialog, {
      values: AUTODELETE_DURATION_OPTIONS,
      selectedValue: settings['delete_server_after'],
      title: tx('autodel_server_title'),
      onSave: async (show: string) => {
          handleDeltaSettingsChange('show_emails', show)
      },
    })
  }

  return (
    <>
      <H5>{tx('pref_communication')}</H5>
      <SettingsSelector
        onClick={onOpenDialog.bind(this, false)}
        currentValue={showToString(settings['show_emails'])}
      >
        {tx('autodel_device_title')}
      </SettingsSelector>
    </>
  )
}
