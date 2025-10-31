import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'

import BackButton from './BackButton'
import CloseButton from './CloseButton'
import DialogHeading from './DialogHeading'
import EditButton from './EditButton'

import type { DialogProps } from '../../contexts/DialogContext'

import styles from './styles.module.scss'
import Button from '../Button'
import Icon from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = PropsWithChildren<{
  title?: string
  /**
   * When this is provided, a "back" button will be shown.
   * Otherwise it will be hidden.
   */
  onClickBack?: () => void
  /**
   * When this is provided, aт "edit" button will be shown.
   * Otherwise it will be hidden.
   */
  onClickEdit?: () => void
  /**
   * When this is provided, a "close" button will be shown.
   * Otherwise it will be hidden.
   */
  onClose?: DialogProps['onClose']
  /**
   * When this is provided, a "three-dot" button will be shown.
   * Otherwise it will be hidden.
   */
  onContextMenuClick?: (_event: any) => void
  dataTestid?: string
}>

export default function DialogHeader(props: Props) {
  const {
    onClickBack,
    title,
    onClose,
    onClickEdit,
    onContextMenuClick,
    children,
  } = props
  const dataTestid = props.dataTestid ?? 'dialog-header'
  const tx = useTranslationFunction()
  return (
    <header className={classNames(styles.dialogHeader)}>
      {onClickBack && (
        <BackButton onClick={onClickBack} data-testid={dataTestid + '-back'} />
      )}
      {title && <DialogHeading>{title}</DialogHeading>}
      {onContextMenuClick && (
        <span
          style={{
            marginLeft: 0,
            marginRight: '3px',
          }}
          data-no-drag-region
        >
          <Button
            className={classNames(styles.headerThreeDotButton)}
            aria-label={tx('menu_more_options')}
            data-testid={dataTestid + '-context-menu'}
            onClick={onContextMenuClick}
            styling='borderless'
          >
            <Icon icon='more' className='rotation90' size={24} />
          </Button>
        </span>
      )}
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
