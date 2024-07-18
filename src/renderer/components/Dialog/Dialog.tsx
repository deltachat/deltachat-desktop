import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'

import type { DialogProps } from '../../contexts/DialogContext'

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
    canEscapeKeyClose

    const dialog = useRef<HTMLDialogElement>(null)

    const onClick = canOutsideClickClose
      ? (ev: React.MouseEvent<HTMLDialogElement>) => {
          if (!dialog.current) {
            return
          }
          ev.stopPropagation()
          // that is the way to check if we clicked on dialog::backdrop
          const rect = dialog.current.getBoundingClientRect()
          const isInDialog =
            rect.top <= ev.clientY &&
            ev.clientY <= rect.top + rect.height &&
            rect.left <= ev.clientX &&
            ev.clientX <= rect.left + rect.width
          if (!isInDialog) {
            dialog.current.close()
          }
        }
      : () => {}

    const onClose = () => {
      dialog.current!.style.display = 'none'
      props.onClose()
    }

    const onCancel = (ev: React.BaseSyntheticEvent) => {
      if (!canEscapeKeyClose) {
        ev.preventDefault()
      }
    }

    useEffect(() => {
      // calling showModal is "only" the way to have ::backdrop
      dialog.current?.showModal()
      dialog.current!.style.display = 'flex'
    })

    return (
      <dialog
        onClick={onClick}
        onClose={onClose}
        onCancel={onCancel}
        ref={dialog}
        className={classNames(styles.dialog, props.className, {
          [styles.fixed]: props.fixed,
        })}
        style={{
          width: width && `${width}px`,
          height: height && `${height}px`,
        }}
      >
        {children}
      </dialog>
    )
  }
)

export default Dialog
