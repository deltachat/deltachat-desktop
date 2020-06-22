import React, { useContext, useState, useEffect } from 'react'
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

export function AutodeleteConfirmationDialog(
  {type, autodeleteDuration, isOpen, onClose} :
  {type: ('device' | 'server'  ), autodeleteDuration: string} & DialogProps
) {

  const fromServer = type === 'server'

  const [estimateCount, setEstimateCount] = useState(null)
  useEffect(() => {
    DeltaBackend.call('settings.get')
  }, [])


  const onOk = () => {
    //handleDeltaSettingsChange('autodel_device_title', value),
    //handleDeltaSettingsChange('autodel_device_title', value),
    //onClose()
  }

  const tx = window.translate

  if (estimateCount === null) return
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
    <DeltaDialogHeader title={fromServer ? tx('autodel_server_title') : tx('autodel_device_title')} />
    <DeltaDialogBody>
      <DeltaDialogContent>
      {tx(fromServer ? 'autodel_server_ask' : 'autodel_device_ask', [autodeleteDuration, String(estimateCount)])}
      </DeltaDialogContent>
    </DeltaDialogBody>
    <DeltaDialogFooter
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0px',
        padding: '7px 13px 10px 13px',
      }}
    >
      <p
        className='delta-button danger bold'
        onClick={() => {
          onClose()
        }}
      >
        {tx('cancel')}
      </p>
      <p className='delta-button primary bold' onClick={onOk}>
        {tx('ok')}
      </p>
    </DeltaDialogFooter>
  </SmallDialog>
  )
}

export default function SettingsAutodelete(props: any) {
  const { openDialog } = useContext(ScreenContext)
  const { handleDeltaSettingsChange, settings } = props

  const tx = window.translate
  const AUTODELETE_DURATION_OPTIONS = [
    [String(AutodeleteDuration.OFF), tx('off')],
    [String(AutodeleteDuration.ONE_HOUR), tx('autodel_after_1_hour')],
    [String(AutodeleteDuration.ONE_DAY), tx('autodel_after_1_day')],
    [String(AutodeleteDuration.ONE_WEEK), tx('autodel_after_1_week')],
    [String(AutodeleteDuration.FOUR_WEEKS), tx('autodel_after_4_weeks')],
    [String(AutodeleteDuration.ONE_YEAR), tx('autodel_after_1_year')],
  ]

  const onOpenDeviceDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: AUTODELETE_DURATION_OPTIONS,
      selectedValue: settings['delete_device_after'],
      title: tx('autodel_device_title'),
      onSave: (value: string) =>
        openDialog(AutodeleteConfirmationDialog, {type: 'device', autodeleteDuration: value})        
    })
  }

  const onOpenServerDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: AUTODELETE_DURATION_OPTIONS,
      selectedValue: settings['delete_server_after'],
      title: tx('autodel_server_title'),
      onSave: (value: string) =>
        openDialog(AutodeleteConfirmationDialog, {type: 'device', autodeleteDuration: value})
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
