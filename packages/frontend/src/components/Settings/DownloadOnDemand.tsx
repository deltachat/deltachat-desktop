import React from 'react'
import { filesize } from 'filesize'

import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import SettingsSelector from './SettingsSelector'
import SmallSelectDialog, { SelectDialogOption } from '../SmallSelectDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export default function DownloadOnDemand(props: {
  settings: SettingsStoreState['settings']
}) {
  const { openDialog } = useDialog()
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
      initialSelectedValue: String(Number(settings['download_limit'])),
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
          filesize(Number.parseInt(settings['download_limit']), {
            base: 2,
          })
        )

  return (
    <SettingsSelector
      onClick={onOpenDialog.bind(null)}
      currentValue={current_limit}
    >
      {tx('auto_download_messages')}
    </SettingsSelector>
  )
}
