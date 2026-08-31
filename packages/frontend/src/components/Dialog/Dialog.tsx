import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'

import styles from './styles.module.scss'
import { runtime } from '@deltachat-desktop/runtime-interface'

const DEFAULT_WIDTH = 500

type Props = React.PropsWithChildren<{
  /**
   * This will be invoked when the dialog is closed e.g. with
   * outside click or Escape key.
   *
   * You must respect this callback and unrender this component
   * when the callback is invoked, otherwise it can so happen
   * that this component is rendered, but the dialog is not acutally visible
   * (this has to do with `showModal`).
   */
  onClose: ((result?: any) => void) | undefined
  /**
   * @default 'any'
   */
  closedby?: HTMLDialogElement['closedBy'] & ('any' | 'closerequest' | 'none')
  /** whether backdrop can be used to drag window around on tauri, used on onboarding screen and deletion screen */
  backdropDragAreaOnTauriRuntime?: boolean
  className?: string
  fixed?: boolean
  height?: number | string
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
  noTopPadding?: boolean
}>

const Dialog = React.memo<Props>(
  ({
    children,
    backdropDragAreaOnTauriRuntime,
    width = DEFAULT_WIDTH,
    height,
    unstyled = false,
    allowDefaultFocus = false,
    noTopPadding = false,
    ...props
  }) => {
    const dialog = useRef<HTMLDialogElement>(null)

    const onClose = (value: any) => {
      props.onClose && props.onClose(value)
      dialog.current!.style.display = 'none'
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
        height: typeof height === 'string' ? height : height && `${height}px`,
      }
    }
    return (
      <dialog
        onClose={onClose}
        closedby={props.closedby ?? 'any'}
        ref={dialog}
        data-no-drag-region
        data-tauri-drag-region={
          backdropDragAreaOnTauriRuntime &&
          runtime.getRuntimeInfo().target === 'tauri'
        }
        className={classNames(styles.dialog, props.className, {
          [styles.unstyled]: unstyled,
          [styles.noTopPadding]: noTopPadding,
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
