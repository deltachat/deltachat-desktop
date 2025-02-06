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
  dataTestid?: string
}>

export default function DialogHeader(props: Props) {
  const { onClickBack, title, onClose, onClickEdit, children } = props
  const dataTestid = props.dataTestid ?? 'dialog-header'
  return (
    <header className={classNames(styles.dialogHeader)}>
      {onClickBack && (
        <BackButton onClick={onClickBack} data-testid={dataTestid + '-back'} />
      )}
      {title && <DialogHeading>{title}</DialogHeading>}
      {children}
      {onClickEdit && (
        <EditButton onClick={onClickEdit} data-testid={dataTestid + '-edit'} />
      )}
      {onClose && (
        <CloseButton onClick={onClose} data-testid={dataTestid + '-close'} />
      )}
    </header>
  )
}
