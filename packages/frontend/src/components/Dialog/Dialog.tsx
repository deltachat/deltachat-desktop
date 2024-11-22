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
            dialog.current.close('cancel')
          }
        }
      : () => {}

    const onClose = (_: any) => {
      props.onClose && props.onClose(dialog.current?.returnValue)
    }

    const onEscapePress = (ev: React.BaseSyntheticEvent) => {
      // by default this fires a 'close' event with undefined as value
      // to unify everything we explicitly call close with 'cancel' value
      ev.preventDefault()
      if (!canEscapeKeyClose) {
        return
      }

      dialog.current?.close('cancel')
    }

    useEffect(() => {
      // calling showModal is "only" the way to have ::backdrop and "cancel" event
      dialog.current?.showModal()
    })

    const style = unstyled
      ? undefined
      : {
          width: width && `${width}px`,
          height: height && `${height}px`,
        }

    // NOTE: do not set method="dialog" on form, it will cause every button to close the dialog
    return (
      <dialog
        onClick={onClick}
        onClose={onClose}
        onCancel={onEscapePress}
        ref={dialog}
        className={classNames(styles.dialog, props.className, {
          [styles.unstyled]: unstyled,
        })}
        style={style}
        data-testid={props['dataTestid']}
      >
        <form>{children}</form>
      </dialog>
    )
  }
)

export default Dialog
