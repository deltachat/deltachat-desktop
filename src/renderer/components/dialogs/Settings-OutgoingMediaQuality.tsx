import React, { useContext } from 'react'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SmallSelectDialog, SelectDialogOption } from './DeltaDialog'
import { SettingsSelector } from './Settings'

import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import { C } from '@deltachat/jsonrpc-client'

export default function SettingsOutgoingMediaQuality(props: {
  settings: SettingsStoreState['settings']
}) {
  const { openDialog } = useContext(ScreenContext)
  const { settings } = props
  const tx = useTranslationFunction()

  const options: { label: string; value: number }[] = [
    { label: tx('pref_outgoing_balanced'), value: C.DC_MEDIA_QUALITY_BALANCED },
    { label: tx('pref_outgoing_worse'), value: C.DC_MEDIA_QUALITY_WORSE },
  ]

  const onOpenDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: options.map(
        ({ label, value }) => [String(value), label] as SelectDialogOption
      ),
      selectedValue: String(Number(settings['media_quality'])),
      title: tx('pref_outgoing_media_quality'),
      onSave: async (option: string) => {
        SettingsStoreInstance.effect.setCoreSetting(
          'media_quality',
          option.toString()
        )
      },
    })
  }

  return (
    <>
      <SettingsSelector
        onClick={onOpenDialog.bind(null, false)}
        currentValue={
          options.find(
            ({ value }) => settings['media_quality'] === String(value)
          )?.label
        }
      >
        {tx('pref_outgoing_media_quality')}
      </SettingsSelector>
    </>
  )
}
