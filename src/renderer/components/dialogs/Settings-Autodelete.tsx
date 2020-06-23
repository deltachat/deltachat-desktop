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
import { DeltaCheckbox } from '../contact/ContactListItem'
import classNames from 'classnames'

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
  {fromServer, estimateCount, seconds, isOpen, onClose, handleDeltaSettingsChange} :
  {fromServer: boolean, estimateCount: number, seconds: number} & DialogProps
) {

  const [isConfirmed, setIsConfirmed] = useState(false)
  const toggleIsConfirmed = () => setIsConfirmed((isConfirmed) => !isConfirmed)

  const onOk = () => {
    if(isConfirmed === false) return
    handleDeltaSettingsChange(fromServer ? 'delete_server_after' : 'delete_device_after', seconds)
    onClose()
  }

  const tx = window.translate

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
    <DeltaDialogHeader title={fromServer ? tx('autodel_server_title') : tx('autodel_device_title')} />
    <DeltaDialogBody>
      <DeltaDialogContent>
        <p style={{whiteSpace: 'pre-line'}}>
          {tx(fromServer ? 'autodel_server_ask' : 'autodel_device_ask', [String(estimateCount), durationToString(seconds)])}
        </p>
        <div style={{display: 'flex'}}>
          <DeltaCheckbox checked={isConfirmed} onClick={toggleIsConfirmed}/>  
          <div style={{alignSelf: 'center'}}>{tx('autodel_confirm')}</div>
        </div>
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
      <p className={classNames('delta-button primary bold', { disabled : !isConfirmed })} onClick={onOk}>
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

  const onOpenDialog = async (fromServer: boolean) => {
    openDialog(SmallSelectDialog, {
      values: AUTODELETE_DURATION_OPTIONS,
      selectedValue: fromServer ? settings['delete_server_after'] : settings['delete_device_after'],
      title: fromServer ? tx('autodel_server_title') : tx('autodel_device_title'),
      onSave: async (_seconds: string) => {
        const seconds = Number(_seconds)
        const estimateCount = await DeltaBackend.call('settings.estimateAutodeleteCount', fromServer, seconds)

        if (seconds === 0) {
          // No need to have a confirmation dialog on disabling
          handleDeltaSettingsChange(fromServer ? 'delete_server_after' : 'delete_device_after', seconds)
          return
        }
        openDialog(AutodeleteConfirmationDialog, {fromServer, estimateCount, seconds, handleDeltaSettingsChange})
      }
    })
  }

  return (
    <>
      <H5>{tx('autodel_title')}</H5>
      <SettingsSelector
        onClick={onOpenDialog.bind(this, false)}
        currentValue={durationToString(settings['delete_device_after'])}
      >
        {tx('autodel_device_title')}
      </SettingsSelector>
      <SettingsSelector
        onClick={onOpenDialog.bind(this, true)}
        currentValue={durationToString(settings['delete_server_after'])}
      >
        {tx('autodel_server_title')}
      </SettingsSelector>
    </>
  )
}
