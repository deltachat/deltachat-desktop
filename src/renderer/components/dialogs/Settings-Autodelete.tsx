import React, { useContext, useState } from 'react'
import { RadioGroup, Radio, Button, H5 } from '@blueprintjs/core'
import { ScreenContext, SettingsContext } from '../../contexts'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
  DeltaDialogHeader,
  SmallDialog,
  SmallSelectDialog,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import { DeltaBackend } from '../../delta-remote'
import { SettingsButton, SettingsSelector } from './Settings'
import { AutodeleteDuration } from '../../../shared/constants'

const tx = window.translate
const AUTODELETE_DURATION_OPTIONS = [
  [String(AutodeleteDuration.OFF), tx('off')],
  [String(AutodeleteDuration.ONE_HOUR), tx('autodel_after_1_hour')],
  [String(AutodeleteDuration.ONE_DAY), tx('autodel_after_1_day')],
  [String(AutodeleteDuration.ONE_WEEK), tx('autodel_after_1_week')],
  [String(AutodeleteDuration.FOUR_WEEKS), tx('autodel_after_4_weeks')],
  [String(AutodeleteDuration.ONE_YEAR), tx('autodel_after_1_year')]
]

function durationToString(configValue: number | string) {
  if (typeof configValue === 'string') configValue = Number(configValue)
  const tx = window.translate
  switch (configValue) {
    case AutodeleteDuration.OFF:
      return tx('off')
    case AutodeleteDuration.ONE_HOUR:
      return tx('autodel_after_1_hour')
    case AutodeleteDuration.ONE_DAY:
      return tx('autodel_after_1_day')
    case AutodeleteDuration.ONE_WEEK:
      return tx('autodel_after_1_week')
    case AutodeleteDuration.FOUR_WEEKS:
      return tx('autodel_after_4_weeks')
    case AutodeleteDuration.ONE_YEAR:
      return tx('autodel_after_1_year')
    default:
      return configValue + ' seconds'
  }
}

export default function SettingsAutodelete(props: any) {
  const { openDialog } = useContext(ScreenContext)
  const { handleDeltaSettingsChange, settings } = props
  const tx = window.translate
  
  const onOpenDeviceDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: AUTODELETE_DURATION_OPTIONS,
      selectedValue: settings['delete_device_after'],
      title: tx('autodel_device_title'),
      onSave: (value:string) => handleDeltaSettingsChange('autodel_device_title', value),
    })
  }
  
  const onOpenServerDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: AUTODELETE_DURATION_OPTIONS,
      selectedValue: settings['delete_server_after'],
      title: tx('autodel_server_title'),
      onSave: (value:string) => handleDeltaSettingsChange('delete_server_after', value),
    })
  }

  return (
    <>
      <H5>{tx('autodel_title')}</H5>
      <SettingsSelector
        onClick={onOpenDeviceDialog}
        currentValue={durationToString(settings['delete_device_after'])}
      >
        {tx('autodel_device_title')}
      </SettingsSelector>
      <SettingsSelector
        onClick={onOpenServerDialog}
        currentValue={durationToString(settings['delete_server_after'])}
      >
        {tx('autodel_server_title')}
      </SettingsSelector>
    </>
  )
}
