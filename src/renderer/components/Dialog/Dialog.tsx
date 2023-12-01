import { Dialog as BlueprintDialog } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'

import type { DialogProps } from '../dialogs/DialogController'

import styles from './styles.module.scss'

type Props = React.PropsWithChildren<
  {
    backdropProps?: any
    canEscapeKeyClose?: boolean
    canOutsideClickClose?: boolean
    className?: string
    fixed?: boolean
    style?: React.CSSProperties
  } & Pick<DialogProps, 'isOpen' | 'onClose'>
>

const Dialog = React.memo<Props>(
  ({
    children,
    canOutsideClickClose = true,
    canEscapeKeyClose = true,
    ...props
  }) => {
    return (
      <BlueprintDialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        canOutsideClickClose={canOutsideClickClose}
        canEscapeKeyClose={canEscapeKeyClose}
        backdropProps={props.backdropProps}
        className={classNames(styles.dialog, props.className, {
          [styles.fixed]: props.fixed,
        })}
        style={props.style}
      >
        {children}
      </BlueprintDialog>
    )
  }
)

export default Dialog
