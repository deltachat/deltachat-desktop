import React, { useState } from 'react'
import Gallery from '../../Gallery'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'
import type { T } from '@deltachat/jsonrpc-client'

import styles from './styles.module.scss'

export default function MediaView(
  props: {
    chat: T.FullChat
  } & DialogProps
) {
  const { onClose, chat } = props
  const tx = useTranslationFunction()

  // This will update the gallery view when needed
  const [galleryUpdated, setGalleryUpdated] = useState(false)
  const onUpdateView = () => setGalleryUpdated(!galleryUpdated)

  return (
    <Dialog
      onClose={onClose}
      className={styles.mediaViewDialog}
    >
      <DialogHeader
        title={tx('menu_all_media')}
        onClose={onClose}
      />
      <DialogBody className={styles.mediaViewDialogBody}>
        <Gallery chatId={chat.id} onUpdateView={onUpdateView} />
      </DialogBody>
    </Dialog>
  )
}
