import React from 'react'

import { SmallSelectDialog, SelectDialogOption } from './DeltaDialog'
import { Timespans } from '../../../shared/constants'
import { selectedAccountId } from '../../ScreenController'
import { BackendRemote, Type } from '../../backend-com'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export default function MuteChat({
  onClose,
  chatId,
}: {
  onClose: () => void
  chatId: number
}) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const MUTE_DURATIONS: [Type.MuteDuration, string][] = [
    [{ kind: 'NotMuted' }, tx('off')],
    [
      { kind: 'Until', duration: Timespans.ONE_HOUR_IN_SECONDS },
      tx('mute_for_one_hour'),
    ],
    [
      { kind: 'Until', duration: Timespans.ONE_HOUR_IN_SECONDS * 2 },
      tx('mute_for_two_hours'),
    ],
    [
      { kind: 'Until', duration: Timespans.ONE_DAY_IN_SECONDS },
      tx('mute_for_one_day'),
    ],
    [
      { kind: 'Until', duration: Timespans.ONE_WEEK_IN_SECONDS },
      tx('mute_for_seven_days'),
    ],
    [{ kind: 'Forever' }, tx('mute_forever')],
  ]
  const MUTE_DURATION_OPTIONS: SelectDialogOption[] = MUTE_DURATIONS.map(
    ([_, label], index) => [String(index), label]
  )

  const onSave = async (optionIndex: string) => {
    const muteDuration = MUTE_DURATIONS[Number(optionIndex)][0]
    await BackendRemote.rpc.setChatMuteDuration(accountId, chatId, muteDuration)
  }

  return (
    <SmallSelectDialog
      title={tx('menu_mute')}
      values={MUTE_DURATION_OPTIONS}
      selectedValue={'0'} // first option selected by default which is "not muted"
      onSave={onSave}
      onClose={onClose}
    />
  )
}
