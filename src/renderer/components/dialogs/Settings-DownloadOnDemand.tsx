import React, { useContext } from 'react'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SmallSelectDialog, SelectDialogOption } from './DeltaDialog'
import { SettingsSelector } from './Settings'
import { todo } from '../../../shared/shared-types'

import filesizeConverter from 'filesize'

export default function SettingsDownloadOnDemand(props: {
  handleDeltaSettingsChange: (key: string, value: any) => void
  settings: todo
}) {
  const { openDialog } = useContext(ScreenContext)
  const { handleDeltaSettingsChange, settings } = props
  const tx = useTranslationFunction()

  const options: { label: string; value: number }[] = [
    { label: tx('no_limit'), value: 0 },
    { label: tx('up_to_x', '40 KiB'), value: 40960 },
    {
      label: tx('up_to_x_most_worse_quality_images', '160 KiB'),
      value: 163840,
    },
    {
      label: tx('up_to_x_most_balanced_quality_images', '640 KiB'),
      value: 655360,
    },
    { label: tx('up_to_x', '5 MiB'), value: 5242880 },
    { label: tx('up_to_x', '25 MiB'), value: 26214400 },
  ]

  const onOpenDialog = async () => {
    openDialog(SmallSelectDialog, {
      values: options.map(
        ({ label, value }) => [String(value), label] as SelectDialogOption
      ),
      selectedValue: String(Number(settings['download_limit'])),
      title: tx('auto_download_messages'),
      onSave: async (bytes: string) => {
        const seconds = Number(bytes)
        handleDeltaSettingsChange('download_limit', seconds)
      },
    })
  }

  const current_limit =
    settings['download_limit'] == 0
      ? tx('no_limit')
      : tx(
          'up_to_x',
          filesizeConverter(settings['download_limit'], { base: 2 })
        )

  return (
    <>
      <SettingsSelector
        onClick={onOpenDialog.bind(null, false)}
        currentValue={current_limit}
      >
        {tx('auto_download_messages')}
      </SettingsSelector>
    </>
  )
}
