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
  SelectDialogOption,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import { DeltaBackend } from '../../delta-remote'
import { SettingsSelector } from './Settings'
import { AutodeleteDuration } from '../../../shared/constants'
import { DeltaCheckbox } from '../contact/ContactListItem'
import classNames from 'classnames'
import SettingsStoreInstance, { SettingsStoreState } from '../../stores/settings'

function durationToString(configValue: number | string) {
  if (typeof configValue === 'string') configValue = Number(configValue)
  const tx = window.static_translate
  switch (configValue) {
    case AutodeleteDuration.NEVER:
      return tx('never')
    case AutodeleteDuration.AT_ONCE:
      return tx('autodel_at_once')
    case AutodeleteDuration.THIRTY_SECONDS:
      return tx('after_30_seconds')
    case AutodeleteDuration.ONE_MINUTE:
      return tx('after_1_minute')
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

export function AutodeleteConfirmationDialog({
  fromServer,
  estimateCount,
  seconds,
  isOpen,
  onClose
}: {
  fromServer: boolean
  estimateCount: number
  seconds: number
} & DialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const toggleIsConfirmed = () => setIsConfirmed(isConfirmed => !isConfirmed)

  const onOk = () => {
    if (isConfirmed === false) return
    SettingsStoreInstance.effect.setCoreSetting(
      fromServer ? 'delete_server_after' : 'delete_device_after',
      seconds.toString()
    )
    onClose()
  }

  const tx = window.static_translate

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <DeltaDialogHeader
        title={
          fromServer ? tx('autodel_server_title') : tx('autodel_device_title')
        }
      />
      <DeltaDialogBody>
        <DeltaDialogContent>
          <p style={{ whiteSpace: 'pre-line' }}>
            {tx(fromServer ? 'autodel_server_ask' : 'autodel_device_ask', [
              String(estimateCount),
              durationToString(seconds),
            ])}
          </p>
          <div style={{ display: 'flex' }}>
            <DeltaCheckbox checked={isConfirmed} onClick={toggleIsConfirmed} />
            <div style={{ alignSelf: 'center' }}>{tx('autodel_confirm')}</div>
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
        <p
          className={classNames('delta-button primary bold', {
            disabled: !isConfirmed,
          })}
          onClick={onOk}
        >
          {tx('ok')}
        </p>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}

export default function SettingsAutodelete({settingsStore}:{settingsStore: SettingsStoreState}) {
  const { openDialog } = useContext(ScreenContext)

  const tx = useTranslationFunction()

  const AUTODELETE_DURATION_OPTIONS_SERVER = [
    AutodeleteDuration.NEVER,
    AutodeleteDuration.AT_ONCE,
    AutodeleteDuration.THIRTY_SECONDS,
    AutodeleteDuration.ONE_MINUTE,
    AutodeleteDuration.ONE_HOUR,
    AutodeleteDuration.ONE_DAY,
    AutodeleteDuration.ONE_WEEK,
    AutodeleteDuration.FOUR_WEEKS,
    AutodeleteDuration.ONE_YEAR,
  ].map(value => [String(value), durationToString(value)] as SelectDialogOption)

  const AUTODELETE_DURATION_OPTIONS_DEVICE = [
    AutodeleteDuration.NEVER,
    AutodeleteDuration.ONE_HOUR,
    AutodeleteDuration.ONE_DAY,
    AutodeleteDuration.ONE_WEEK,
    AutodeleteDuration.FOUR_WEEKS,
    AutodeleteDuration.ONE_YEAR,
  ].map(value => [String(value), durationToString(value)] as SelectDialogOption)

  const onOpenDialog = async (fromServer: boolean) => {
    openDialog(SmallSelectDialog, {
      values: fromServer
        ? AUTODELETE_DURATION_OPTIONS_SERVER
        : AUTODELETE_DURATION_OPTIONS_DEVICE,
      selectedValue: fromServer
        ? settingsStore.settings['delete_server_after']
        : settingsStore.settings['delete_device_after'],
      title: fromServer
        ? tx('autodel_server_title')
        : tx('autodel_device_title'),
      onSave: async (_seconds: string) => {
        const seconds = Number(_seconds)
        const estimateCount = await DeltaBackend.call(
          'settings.estimateAutodeleteCount',
          fromServer,
          seconds
        )

        if (seconds === 0) {
          // No need to have a confirmation dialog on disabling
          SettingsStoreInstance.effect.setCoreSetting(
            fromServer ? 'delete_server_after' : 'delete_device_after',
            seconds.toString()
          )
          return
        }
        openDialog(AutodeleteConfirmationDialog, {
          fromServer,
          estimateCount,
          seconds
        })
      },
    })
  }

  return (
    <>
      <H5>{tx('delete_old_messages')}</H5>
      <SettingsSelector
        onClick={onOpenDialog.bind(null, false)}
        currentValue={durationToString(settingsStore.settings['delete_device_after'])}
      >
        {tx('autodel_device_title')}
      </SettingsSelector>
      <SettingsSelector
        onClick={onOpenDialog.bind(null, true)}
        currentValue={durationToString(settingsStore.settings['delete_server_after'])}
      >
        {tx('autodel_server_title')}
      </SettingsSelector>
    </>
  )
}
