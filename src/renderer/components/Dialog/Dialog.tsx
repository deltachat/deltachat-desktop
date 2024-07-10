import classNames from 'classnames'
import React from 'react'

import type { DialogProps } from '../../contexts/DialogContext'

import Overlay from '../Overlay'

import styles from './styles.module.scss'

const DEFAULT_WIDTH = 500

type Props = React.PropsWithChildren<
  {
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
    canOutsideClickClose
    canEscapeKeyClose

    const onOverlayClick = canOutsideClickClose
      ? (ev: React.MouseEvent) => {
          ev.preventDefault()
          props.onClose()
        }
      : () => {}

    return (
      <div>
        <Overlay onClick={onOverlayClick} isOpen={true}>
          <div
            className={classNames(styles.dialog, props.className, {
              [styles.fixed]: props.fixed,
            })}
            style={{
              width: width && `${width}px`,
              height: height && `${height}px`,
            }}
          >
            {children}
          </div>
        </Overlay>
      </div>
    )
  }
)

export default Dialog
