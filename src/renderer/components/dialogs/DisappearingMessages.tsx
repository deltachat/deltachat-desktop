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
import { Timespans } from '../../../shared/constants'
import { useTranslationFunction } from '../../contexts'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

enum DisappearingMessageDuration {
  OFF = Timespans.ZERO_SECONDS,
  ONE_MINUTE = Timespans.ONE_MINUTE_IN_SECONDS,
  FIVE_MINUTES = Timespans.ONE_MINUTE_IN_SECONDS * 5,
  THIRTY_MINUTES = Timespans.ONE_MINUTE_IN_SECONDS * 30,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  ONE_WEEK = Timespans.ONE_WEEK_IN_SECONDS,
  FIVE_WEEKS = Timespans.ONE_WEEK_IN_SECONDS * 5,
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
        label={tx('after_1_minute')}
        value={String(DisappearingMessageDuration.ONE_MINUTE)}
      />
      <Radio
        key={'eph-2'}
        label={tx('after_5_minutes')}
        value={String(DisappearingMessageDuration.FIVE_MINUTES)}
      />
      <Radio
        key={'eph-3'}
        label={tx('after_30_minutes')}
        value={String(DisappearingMessageDuration.THIRTY_MINUTES)}
      />
      <Radio
        key={'eph-4'}
        label={tx('autodel_after_1_hour')}
        value={String(DisappearingMessageDuration.ONE_HOUR)}
      />
      <Radio
        key={'eph-5'}
        label={tx('autodel_after_1_day')}
        value={String(DisappearingMessageDuration.ONE_DAY)}
      />
      <Radio
        key={'eph-6'}
        label={tx('autodel_after_1_week')}
        value={String(DisappearingMessageDuration.ONE_WEEK)}
      />
      <Radio
        key={'eph-7'}
        label={tx('autodel_after_5_weeks')}
        value={String(DisappearingMessageDuration.FIVE_WEEKS)}
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
      const ephemeralTimer = await BackendRemote.rpc.getChatEphemeralTimer(
        selectedAccountId(),
        chatId
      )
      setDisappearingMessageDuration(ephemeralTimer)
      setLoading(false)
    })()
  }, [chatId])

  const saveAndClose = async () => {
    await BackendRemote.rpc.setChatEphemeralTimer(
      selectedAccountId(),
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
