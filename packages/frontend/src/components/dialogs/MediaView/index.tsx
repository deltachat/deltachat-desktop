import React from 'react'
import Gallery from '../../Gallery'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'

import styles from './styles.module.scss'

export default function MediaView(
  props: {
    chatId: number | 'all'
  } & DialogProps
) {
  const { onClose, chatId } = props
  const tx = useTranslationFunction()
  const headerString =
    chatId === 'all' ? tx('all_apps_and_media') : tx('apps_and_media')

  return (
    <Dialog onClose={onClose} className={styles.mediaViewDialog}>
      <DialogHeader title={headerString} onClose={onClose} />
      <DialogBody className={styles.mediaViewDialogBody}>
        <Gallery chatId={chatId} />
      </DialogBody>
    </Dialog>
  )
}
