import { SmallSelectDialog, SelectDialogOption } from './DeltaDialog'
import React from 'react'
import { Timespans } from '../../../shared/constants'
import { selectedAccountId } from '../../ScreenController'
import { BackendRemote, Type } from '../../backend-com'

export default function MuteChat({
  isOpen,
  onClose,
  chatId,
}: {
  isOpen: boolean
  onClose: () => void
  chatId: number
}) {
  const accountId = selectedAccountId()
  const tx = window.static_translate

  const MUTE_DURATIONS: [Type.MuteDuration, string][] = [
    ['NotMuted', tx('off')],
    [{ Until: Timespans.ONE_HOUR_IN_SECONDS }, tx('mute_for_one_hour')],
    [{ Until: Timespans.TWO_HOURS_IN_SECONDS }, tx('mute_for_two_hours')],
    [{ Until: Timespans.ONE_DAY_IN_SECONDS }, tx('mute_for_one_day')],
    [{ Until: Timespans.ONE_WEEK_IN_SECONDS }, tx('mute_for_seven_days')],
    ['Forever', tx('mute_forever')],
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
      isOpen={isOpen}
      onSave={onSave}
      onClose={onClose}
    />
  )
}
