import React, { useState, useEffect } from 'react'
import {
  DeltaDialogBody,
  DeltaDialogFooter,
  DeltaDialogContent,
  SmallDialog,
  DeltaDialogHeader,
} from './DeltaDialog'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { Timespans } from '../../../shared/constants'

enum EphemeralMessageDuration {
  OFF = Timespans.ZERO_SECONDS,
  ONE_SECOND = Timespans.ONE_SECOND,
  ONE_MINUTE = Timespans.ONE_MINUTE_IN_SECONDS,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  ONE_WEEK = Timespans.ONE_WEEK_IN_SECONDS,
  FOUR_WEEKS = Timespans.FOUR_WEEKS_IN_SECONDS,
}

function SelectEphemeralMessageDuration({
  onSelectEphemeralMessageDuration,
  ephemeralMessageDuration,
}: {
  onSelectEphemeralMessageDuration: (
    ephemeralMessageDuration: EphemeralMessageDuration
  ) => void
  ephemeralMessageDuration: EphemeralMessageDuration
}) {
  const tx = window.translate

  const onChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const ephemeralMessageDuration = Number(ev.currentTarget.value)
    onSelectEphemeralMessageDuration(ephemeralMessageDuration)
  }

  return (
    <RadioGroup
      onChange={onChange}
      selectedValue={String(ephemeralMessageDuration)}
    >
      <Radio
        key={'eph-0'}
        label={tx('off')}
        value={String(EphemeralMessageDuration.OFF)}
      />
      <Radio
        key={'eph-1'}
        label={'One second'}
        value={String(EphemeralMessageDuration.ONE_SECOND)}
      />
      <Radio
        key={'eph-2'}
        label={'One minute'}
        value={String(EphemeralMessageDuration.ONE_MINUTE)}
      />
      <Radio
        key={'eph-3'}
        label={'One hour'}
        value={String(EphemeralMessageDuration.ONE_HOUR)}
      />
      <Radio
        key={'eph-4'}
        label={'One day'}
        value={String(EphemeralMessageDuration.ONE_DAY)}
      />
      <Radio
        key={'eph-5'}
        label={'One week'}
        value={String(EphemeralMessageDuration.ONE_WEEK)}
      />
      <Radio
        key={'eph-6'}
        label={'Four weeks'}
        value={String(EphemeralMessageDuration.FOUR_WEEKS)}
      />
    </RadioGroup>
  )
}

export default function EphemeralMessage({
  isOpen,
  onClose,
  chatId,
}: {
  isOpen: boolean
  onClose: () => void
  chatId: number
}) {
  const [ephemeralMessageDuration, setEphemeralMessageDuration] = useState<
    EphemeralMessageDuration
  >(EphemeralMessageDuration.OFF)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const ephemeralTimer = await DeltaBackend.call(
        'chat.getChatEphemeralTimer',
        chatId
      )
      setEphemeralMessageDuration(ephemeralTimer)
      setLoading(false)
    })()
  }, [])

  const saveAndClose = async () => {
    await DeltaBackend.call(
      'chat.setChatEphemeralTimer',
      chatId,
      ephemeralMessageDuration
    )
    onClose()
  }

  const tx = window.translate
  return (
    !loading && (
      <SmallDialog isOpen={isOpen} onClose={onClose}>
        <DeltaDialogHeader title={'Ephemeral Message'} />
        <DeltaDialogBody>
          <DeltaDialogContent>
            <SelectEphemeralMessageDuration
              ephemeralMessageDuration={ephemeralMessageDuration}
              onSelectEphemeralMessageDuration={setEphemeralMessageDuration}
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
  )
}
