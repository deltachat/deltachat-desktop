import React from 'react'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

import { DialogProps } from '../dialogs/DialogController'
import EditButton from './EditButton'
import CloseButton from './CloseButton'
import BackButton from './BackButton'

type Props = {
  title?: string
  onClickBack?: () => void
  onClickEdit?: () => void
  onClose?: DialogProps['onClose']
  children?: React.ReactNode
  showBackButton?: boolean
  showEditButton?: boolean
  showCloseButton?: boolean
}

export default function DialogHeader(props: Props) {
  const {
    onClickBack,
    title,
    onClose,
    onClickEdit,
    children,
    showCloseButton,
    showEditButton,
  } = props

  let showBackButton = props.showBackButton
  if (typeof showBackButton === 'undefined')
    showBackButton = typeof onClickBack === 'function'

  return (
    <div
      className={classNames(
        Classes.DIALOG_HEADER,
        'bp4-dialog-header-border-bottom'
      )}
    >
      {showBackButton && <BackButton onClick={onClickBack} />}
      {title && <h4 className='bp4-heading'>{title}</h4>}
      {children}
      {showEditButton && <EditButton onClick={onClickEdit} />}
      {typeof onClose === 'function' && showCloseButton !== false && (
        <CloseButton onClick={onClose} />
      )}
    </div>
  )
}
