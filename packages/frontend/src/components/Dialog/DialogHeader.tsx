import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'

import BackButton from './BackButton'
import CloseButton from './CloseButton'
import DialogHeading from './DialogHeading'
import EditButton from './EditButton'

import type { DialogProps } from '../../contexts/DialogContext'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  title?: string
  onClickBack?: () => void
  onClickEdit?: () => void
  onClose?: DialogProps['onClose']
}>

export default function DialogHeader(props: Props) {
  const { onClickBack, title, onClose, onClickEdit, children } = props

  return (
    <header className={classNames(styles.dialogHeader, 'drag')}>
      {onClickBack && <BackButton onClick={onClickBack} />}
      {title && <DialogHeading>{title}</DialogHeading>}
      {children}
      {onClickEdit && <EditButton onClick={onClickEdit} />}
      {onClose && <CloseButton onClick={onClose} />}
    </header>
  )
}
