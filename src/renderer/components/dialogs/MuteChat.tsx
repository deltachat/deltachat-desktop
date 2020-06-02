import { DialogProps } from './DialogController'
import {
  SmallDialog,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogFooter,
  SmallSelectDialog,
} from './DeltaDialog'
import React, { useState } from 'react'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { DeltaBackend } from '../../delta-remote'
import { MuteDuration } from '../../../shared/constants'

export default function MuteChat({
  isOpen,
  onClose,
  chatId,
}: {
  isOpen: boolean
  onClose: () => void
  chatId: number
}) {
  const tx = window.translate

  const MUTE_DURATION_OPTIONS: [string, string][] = [
    [String(MuteDuration.OFF), tx('off')],
    [String(MuteDuration.ONE_HOUR), tx('mute_for_one_hour')],
    [String(MuteDuration.TWO_HOURS), tx('mute_for_two_hours')],
    [String(MuteDuration.ONE_DAY), tx('mute_for_one_day')],
    [String(MuteDuration.SEVEN_DAYS), tx('mute_for_seven_days')],
    [String(MuteDuration.FOREVER), tx('mute_forever')],
  ]
  const [muteDuration, setMuteDuration] = useState<MuteDuration>(
    MuteDuration.OFF
  )

  const onSave = async () => {
    await DeltaBackend.call('chat.setMuteDuration', chatId, muteDuration)
  }

  return (
    <SmallSelectDialog
      title={tx('menu_mute')}
      values={MUTE_DURATION_OPTIONS}
      selectedValue={String(muteDuration)}
      isOpen={isOpen}
      onSave={onSave}
      onClose={onClose}
    />
  )
}
