import { DialogProps } from './DialogController'
import {
  SmallDialog,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
} from './DeltaDialog'
import React, { useState } from 'react'
import { isOpen } from '@blueprintjs/core/lib/esm/components/context-menu/contextMenu'
import { AutodeleteTimeDurations } from './Settings-Autodelete'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { MuteDuration } from '../../../shared/shared-types'

export function SelectMuteDuration({
  onSelectMuteDuration,
  muteDuration,
}: {
  onSelectMuteDuration: (muteDuration: MuteDuration) => void
  muteDuration: MuteDuration
}) {
  const tx = window.translate

  const onChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const muteDuration = Number(ev.currentTarget.value)
    onSelectMuteDuration(muteDuration)
  }

  return (
    <RadioGroup onChange={onChange} selectedValue={String(muteDuration)}>
      <Radio
        key={'mute-0'}
        label={tx('off')}
        value={String(MuteDuration.OFF)}
      />
      {/* Mute for 1 hour (60*60 seconds) */}
      <Radio
        key={'mute-1'}
        label={tx('mute_for_one_hour')}
        value={String(MuteDuration.ONE_HOUR)}
      />
      {/* Mute for 2 hours (60*60*2 seconds) */}
      <Radio
        key={'mute-2'}
        label={tx('mute_for_two_hours')}
        value={String(MuteDuration.TWO_HOURS)}
      />
      {/* Mute for 1 day (60*60*24 seconds) */}
      <Radio
        key={'mute-3'}
        label={tx('mute_for_one_day')}
        value={String(MuteDuration.ONE_DAY)}
      />
      {/* Mute for 7 days (60*60*24*7 seconds) */}
      <Radio
        key={'mute-4'}
        label={tx('mute_for_seven_days')}
        value={String(MuteDuration.SEVEN_DAYS)}
      />
      {/* Mute for forever (60*60*24*365 seconds) */}
      <Radio
        key={'del-5'}
        label={tx('mute_forever')}
        value={String(MuteDuration.FOREVER)}
      />
    </RadioGroup>
  )
}

export default function MuteChat({
  isOpen,
  onClose,
  chatId,
}: {
  isOpen: boolean
  onClose: () => void
  chatId: number
}) {
  const [muteDuration, setMuteDuration] = useState<MuteDuration>(
    MuteDuration.OFF
  )

  const saveAndClose = async () => {
    await DeltaBackend.call('chat.setMuteDuration', chatId, muteDuration)
    onClose()
  }

  const tx = window.translate
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <DeltaDialogHeader title={tx('menu_mute')} />
      <DeltaDialogBody>
        <DeltaDialogContent>
          <SelectMuteDuration
            muteDuration={muteDuration}
            onSelectMuteDuration={setMuteDuration}
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
