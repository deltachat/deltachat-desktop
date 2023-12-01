import React from 'react'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

import EditButton from './EditButton'
import CloseButton from './CloseButton'
import BackButton from './BackButton'

import type { DialogProps } from '../dialogs/DialogController'

import styles from './styles.module.scss'

type Props = {
  title?: string
  onClickBack?: () => void
  onClickEdit?: () => void
  onClose?: DialogProps['onClose']
  children?: React.ReactNode
}

export default function DialogHeader(props: Props) {
  const { onClickBack, title, onClose, onClickEdit, children } = props

  return (
    <header className={classNames(Classes.DIALOG_HEADER, styles.dialogHeader)}>
      {onClickBack && <BackButton onClick={onClickBack} />}
      {title && <h4 className='bp4-heading'>{title}</h4>}
      {children}
      {onClickEdit && <EditButton onClick={onClickEdit} />}
      {onClose && <CloseButton onClick={onClose} />}
    </header>
  )
}
