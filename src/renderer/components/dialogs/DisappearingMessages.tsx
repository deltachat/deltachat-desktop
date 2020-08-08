import React, { useState, useEffect } from 'react'
import {
  DeltaDialogBody,
  DeltaDialogFooter,
  DeltaDialogContent,
  SmallDialog,
  DeltaDialogHeader,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { Timespans } from '../../../shared/constants'
import { useTranslationFunction } from '../../contexts'

enum DisappearingMessageDuration {
  OFF = Timespans.ZERO_SECONDS,
  THIRTY_SECONDS = Timespans.THIRTY_SECONDS,
  ONE_MINUTE = Timespans.ONE_MINUTE_IN_SECONDS,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  ONE_WEEK = Timespans.ONE_WEEK_IN_SECONDS,
  FOUR_WEEKS = Timespans.FOUR_WEEKS_IN_SECONDS,
}

function SelectDisappearingMessageDuration({
  onSelectDisappearingMessageDuration,
  disappearingMessageDuration,
}: {
  onSelectDisappearingMessageDuration: (
    disappearingMessageDuration: DisappearingMessageDuration
  ) => void
  disappearingMessageDuration: DisappearingMessageDuration
}) {
  const tx = useTranslationFunction()

  const onChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const disappearingMessageDuration = Number(ev.currentTarget.value)
    onSelectDisappearingMessageDuration(disappearingMessageDuration)
  }

  return (
    <RadioGroup
      onChange={onChange}
      selectedValue={String(disappearingMessageDuration)}
    >
      <Radio
        key={'eph-0'}
        label={tx('off')}
        value={String(DisappearingMessageDuration.OFF)}
      />
      <Radio
        key={'eph-1'}
        label={tx('after_30_seconds')}
        value={String(DisappearingMessageDuration.THIRTY_SECONDS)}
      />
      <Radio
        key={'eph-2'}
        label={tx('after_1_minute')}
        value={String(DisappearingMessageDuration.ONE_MINUTE)}
      />
      <Radio
        key={'eph-3'}
        label={tx('autodel_after_1_hour')}
        value={String(DisappearingMessageDuration.ONE_HOUR)}
      />
      <Radio
        key={'eph-4'}
        label={tx('autodel_after_1_day')}
        value={String(DisappearingMessageDuration.ONE_DAY)}
      />
      <Radio
        key={'eph-5'}
        label={tx('autodel_after_1_week')}
        value={String(DisappearingMessageDuration.ONE_WEEK)}
      />
      <Radio
        key={'eph-6'}
        label={tx('autodel_after_4_weeks')}
        value={String(DisappearingMessageDuration.FOUR_WEEKS)}
      />
    </RadioGroup>
  )
}

export default function DisappearingMessage({
  isOpen,
  onClose,
  chatId,
}: {
  isOpen: boolean
  onClose: () => void
  chatId: number
}) {
  const [
    disappearingMessageDuration,
    setDisappearingMessageDuration,
  ] = useState<DisappearingMessageDuration>(DisappearingMessageDuration.OFF)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const ephemeralTimer = await DeltaBackend.call(
        'chat.getChatEphemeralTimer',
        chatId
      )
      setDisappearingMessageDuration(ephemeralTimer)
      setLoading(false)
    })()
  }, [])

  const saveAndClose = async () => {
    await DeltaBackend.call(
      'chat.setChatEphemeralTimer',
      chatId,
      disappearingMessageDuration
    )
    onClose()
  }

  const tx = useTranslationFunction()
  return (
    !loading && (
      <SmallDialog isOpen={isOpen} onClose={onClose}>
        <DeltaDialogHeader title={tx('ephemeral_messages')} />
        <DeltaDialogBody>
          <DeltaDialogContent>
            <SelectDisappearingMessageDuration
              disappearingMessageDuration={disappearingMessageDuration}
              onSelectDisappearingMessageDuration={
                setDisappearingMessageDuration
              }
            />
            <p>{tx('ephemeral_messages_hint')}</p>
          </DeltaDialogContent>
        </DeltaDialogBody>
        <DeltaDialogFooter style={{ padding: '20px' }}>
          <DeltaDialogFooterActions>
            <p className='delta-button primary bold' onClick={onClose}>
              {tx('cancel')}
            </p>
            <p className='delta-button primary bold' onClick={saveAndClose}>
              {tx('save_desktop')}
            </p>
          </DeltaDialogFooterActions>
        </DeltaDialogFooter>
      </SmallDialog>
    )
  )
}
