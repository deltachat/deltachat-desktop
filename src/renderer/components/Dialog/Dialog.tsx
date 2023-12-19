import { Dialog as BlueprintDialog } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'

import type { DialogProps } from '../../contexts/DialogContext'

import styles from './styles.module.scss'

const DEFAULT_WIDTH = 500

type Props = React.PropsWithChildren<
  {
    backdropProps?: any
    canEscapeKeyClose?: boolean
    canOutsideClickClose?: boolean
    className?: string
    fixed?: boolean
    height?: number
    width?: number
  } & DialogProps
>

const Dialog = React.memo<Props>(
  ({
    children,
    canOutsideClickClose = true,
    canEscapeKeyClose = true,
    width = DEFAULT_WIDTH,
    height,
    ...props
  }) => {
    return (
      <BlueprintDialog
        isOpen
        onClose={props.onClose}
        canOutsideClickClose={canOutsideClickClose}
        canEscapeKeyClose={canEscapeKeyClose}
        backdropProps={props.backdropProps}
        className={classNames(styles.dialog, props.className, {
          [styles.fixed]: props.fixed,
        })}
        style={{
          width: width && `${width}px`,
          height: height && `${height}px`,
        }}
      >
        {children}
      </BlueprintDialog>
    )
  }
)

export default Dialog
