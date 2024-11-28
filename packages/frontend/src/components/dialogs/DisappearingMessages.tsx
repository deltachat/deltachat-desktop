import React, { useState, useEffect } from 'react'

import { Timespans } from '../../../../shared/constants'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import Radio from '../Radio'
import RadioGroup from '../RadioGroup'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { runtime } from '@deltachat-desktop/runtime-interface'

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

  const onChange = (duration: string) => {
    onSelectDisappearingMessageDuration(Number(duration))
  }

  return (
    <RadioGroup
      name='disappearing-message-duration'
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
        label={tx('after_5_weeks')}
        value={String(DisappearingMessageDuration.FIVE_WEEKS)}
      />
    </RadioGroup>
  )
}

export default function DisappearingMessage({
  chatId,
  onClose,
}: { chatId: number } & DialogProps) {
  const [disappearingMessageDuration, setDisappearingMessageDuration] =
    useState<DisappearingMessageDuration>(DisappearingMessageDuration.OFF)
  const tx = useTranslationFunction()

  useEffect(() => {
    ;(async () => {
      const ephemeralTimer = await BackendRemote.rpc.getChatEphemeralTimer(
        selectedAccountId(),
        chatId
      )
      setDisappearingMessageDuration(ephemeralTimer)
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

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={tx('ephemeral_messages')} />
      <DialogBody>
        <DialogContent>
          <SelectDisappearingMessageDuration
            disappearingMessageDuration={disappearingMessageDuration}
            onSelectDisappearingMessageDuration={setDisappearingMessageDuration}
          />
          <p>{tx('ephemeral_messages_hint')}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton
            onClick={() => runtime.openHelpWindow('ephemeralmsgs')}
          >
            {tx('learn_more')}
          </FooterActionButton>
          <FooterActionButton onClick={onClose}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton onClick={saveAndClose}>
            {tx('save_desktop')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
