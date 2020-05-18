import React, { useContext, useState } from 'react'
import { RadioGroup, Radio, Button, H5 } from '@blueprintjs/core'
import { ScreenContext, SettingsContext } from '../../contexts'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
  DeltaDialogHeader,
  SmallDialog,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import { DeltaBackend } from '../../delta-remote'
import { SettingsButton, SettingsSelector } from './Settings'
import { AutodeleteDuration } from '../../../shared/shared-types'

export function AutodeleteTimeDurations({
  onChange,
  selectedValue,
}: {
  onChange: any
  selectedValue: number
}) {
  const tx = window.translate
  return (
    <RadioGroup onChange={onChange} selectedValue={selectedValue}>
      <Radio
        key={'del-0'}
        label={tx('off')}
        value={String(AutodeleteDuration.OFF)}
      />
      {/* Delete after 1 hour (60*60 seconds) */}
      <Radio
        key={'del-1'}
        label={tx('autodel_after_1_hour')}
        value={String(AutodeleteDuration.ONE_HOUR)}
      />
      {/* Delete after 1 day (60*60*24 seconds) */}
      <Radio
        key={'del-2'}
        label={tx('autodel_after_1_day')}
        value={String(AutodeleteDuration.ONE_DAY)}
      />
      {/* Delete after 1 week (60*60*24*7 seconds) */}
      <Radio
        key={'del-3'}
        label={tx('autodel_after_1_week')}
        value={String(AutodeleteDuration.ONE_WEEK)}
      />
      {/* Delete after 4 weeks (60*60*24*7*4 seconds) */}
      <Radio
        key={'del-4'}
        label={tx('autodel_after_4_weeks')}
        value={String(AutodeleteDuration.FOUR_WEEKS)}
      />
      {/* Delete after 1 year (60*60*24*365 seconds) */}
      <Radio
        key={'del-5'}
        label={tx('autodel_after_1_year')}
        value={String(AutodeleteDuration.ONE_YEAR)}
      />
    </RadioGroup>
  )
}

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

function SelectAutodeleteDurationDialog(props: DialogProps) {
  const tx = window.translate

  const { isOpen, onClose } = props
  const { configValue, configKey, label, handleDeltaSettingsChange } = props

  const [selectedValue, setSelectedValue] = useState<string>(configValue)
  const saveAndClose = async () => {
    handleDeltaSettingsChange(configKey, selectedValue)
    onClose()
  }
  const onChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const value: string = ev.currentTarget.value
    setSelectedValue(value)
  }
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <DeltaDialogHeader title={label} />
      <DeltaDialogBody>
        <DeltaDialogContent>
          <AutodeleteTimeDurations
            onChange={onChange}
            selectedValue={Number(selectedValue)}
          />
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
        <p className='delta-button danger bold' onClick={onClose}>
          {tx('cancel')}
        </p>
        <p className='delta-button primary bold' onClick={saveAndClose}>
          {tx('save_desktop')}
        </p>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}
export default function SettingsAutodelete(props: any) {
  const { openDialog } = useContext(ScreenContext)
  const { handleDeltaSettingsChange, settings } = props
  const tx = window.translate
  const onOpenDeviceDialog = async () => {
    const label = tx('autodel_device_title')
    const configKey = 'delete_device_after'
    const configValue: string = settings['delete_device_after']

    openDialog(SelectAutodeleteDurationDialog, {
      configKey,
      label,
      configValue,
      handleDeltaSettingsChange,
    })
  }
  const onOpenServerDialog = async () => {
    const label = tx('autodel_server_title')
    const configKey = 'delete_server_after'
    const configValue: string = settings['delete_server_after']

    openDialog(SelectAutodeleteDurationDialog, {
      configKey,
      label,
      configValue,
      handleDeltaSettingsChange,
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
