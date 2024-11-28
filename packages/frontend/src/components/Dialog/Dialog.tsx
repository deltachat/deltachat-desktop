import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'

import styles from './styles.module.scss'

const DEFAULT_WIDTH = 500

type Props = React.PropsWithChildren<{
  onClose?: (result?: any) => void
  canEscapeKeyClose?: boolean
  canOutsideClickClose?: boolean
  className?: string
  fixed?: boolean
  height?: number
  width?: number
  // takes full screen and is transparent
  unstyled?: boolean
  dataTestid?: string
}>

const Dialog = React.memo<Props>(
  ({
    children,
    canOutsideClickClose = true,
    canEscapeKeyClose = true,
    width = DEFAULT_WIDTH,
    height,
    unstyled = false,
    ...props
  }) => {
    const dialog = useRef<HTMLDialogElement>(null)

    const onClick = canOutsideClickClose
      ? (ev: React.MouseEvent<HTMLDialogElement>) => {
          if (!dialog.current) {
            return
          }
          // pressing a button with Spacebar inside a dialog
          // triggers the `onClick` event.
          // Let's ignore such "clicks" here.
          if (ev.screenX == 0 && ev.screenY == 0) {
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
            const cancelEvent = new Event('cancel')
            dialog.current.dispatchEvent(cancelEvent)
            // cancel event doesn't trigger dialog close
            dialog.current.close()
          }
        }
      : () => {}

    const onClose = (value: any) => {
      props.onClose && props.onClose(value)
      dialog.current!.style.display = 'none'
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

    let style

    if (!unstyled) {
      style = {
        width: width && `${width}px`,
        height: height && `${height}px`,
      }
    }

    return (
      <dialog
        onClick={onClick}
        onClose={onClose}
        onCancel={onCancel}
        ref={dialog}
        className={classNames(styles.dialog, props.className, 'no-drag', {
          [styles.unstyled]: unstyled,
        })}
        style={style}
        data-testid={props['dataTestid']}
      >
        {children}
      </dialog>
    )
  }
)

export default Dialog
