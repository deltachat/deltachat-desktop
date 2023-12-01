import React, { useContext } from 'react'
import filesizeConverter from 'filesize'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import { SelectDialogOption, SmallSelectDialog } from '../dialogs/DeltaDialog'
import SettingsSelector from './SettingsSelector'

export default function DownloadOnDemand(props: {
  settings: SettingsStoreState['settings']
}) {
  const { openDialog } = useContext(ScreenContext)
  const { settings } = props
  const tx = useTranslationFunction()

  const options: { label: string; value: number }[] = [
    { label: tx('pref_show_emails_all'), value: 0 },
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
        SettingsStoreInstance.effect.setCoreSetting(
          'download_limit',
          seconds.toString()
        )
      },
    })
  }

  const current_limit =
    settings['download_limit'] == '0'
      ? tx('pref_show_emails_all')
      : tx(
          'up_to_x',
          filesizeConverter(Number.parseInt(settings['download_limit']), {
            base: 2,
          })
        )

  return (
    <>
      <SettingsSelector
        onClick={onOpenDialog.bind(null)}
        currentValue={current_limit}
      >
        {tx('auto_download_messages')}
      </SettingsSelector>
    </>
  )
}
