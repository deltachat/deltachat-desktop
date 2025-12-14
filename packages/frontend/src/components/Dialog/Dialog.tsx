import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'

import styles from './styles.module.scss'
import { runtime } from '@deltachat-desktop/runtime-interface'

// same as $default-dialog-width variable in styles
const DEFAULT_WIDTH = 500

type Props = React.PropsWithChildren<{
  /**
   * This will be invoked when the dialog is closed e.g. with
   * outside click ({@linkcode canOutsideClickClose})
   * or {@linkcode canEscapeKeyClose}.
   *
   * You must respect this callback and unrender this component
   * when the callback is invoked, otherwise it can so happen
   * that this component is rendered, but the dialog is not acutally visible
   * (this has to do with `showModal`).
   */
  onClose: ((result?: any) => void) | undefined
  canEscapeKeyClose?: boolean
  canOutsideClickClose?: boolean
  /** whether backdrop can be used to drag window around on tauri, used on onboarding screen and deletion screen */
  backdropDragAreaOnTauriRuntime?: boolean
  className?: string
  fixed?: boolean
  height?: number
  width?: number
  // takes full screen and is transparent
  unstyled?: boolean
  dataTestid?: string
  /**
   * per default the first element in a modal dialog is focused
   * but we remove that focus if the first element is a button or
   * a 'button like' element to avoid unexpected behaviours
   * set this to true to keep the default focus behavior also for buttons
   */
  allowDefaultFocus?: boolean
}>

const Dialog = React.memo<Props>(
  ({
    children,
    canOutsideClickClose = true,
    canEscapeKeyClose = true,
    backdropDragAreaOnTauriRuntime,
    width = DEFAULT_WIDTH,
    height,
    unstyled = false,
    allowDefaultFocus = false,
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
    const onKeyDown = (ev: React.KeyboardEvent) => {
      if (ev.code === 'Escape') {
        onCancel(ev)
      }
    }

    useEffect(() => {
      // calling showModal is "only" the way to have ::backdrop
      dialog.current?.showModal()
      dialog.current!.style.display = 'flex'
      if (!allowDefaultFocus && document.activeElement instanceof HTMLElement) {
        const tagName = document.activeElement.tagName.toLowerCase()
        const isButtonLikeInput =
          tagName === 'input' &&
          ['submit', 'button', 'image', 'reset'].includes(
            (document.activeElement as HTMLInputElement).type
          )

        if (
          (tagName === 'button' || isButtonLikeInput) &&
          !document.activeElement.hasAttribute('autofocus')
        ) {
          // Remove focus from auto-focused buttons or button like elements
          document.activeElement.blur()
        }
      }
    }, [allowDefaultFocus])

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
        onKeyDown={onKeyDown}
        ref={dialog}
        data-no-drag-region
        data-tauri-drag-region={
          backdropDragAreaOnTauriRuntime &&
          runtime.getRuntimeInfo().target === 'tauri'
        }
        className={classNames(styles.dialog, props.className, {
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
