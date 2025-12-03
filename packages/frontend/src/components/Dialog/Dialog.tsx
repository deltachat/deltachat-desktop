import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'

import styles from './styles.module.scss'
import { runtime } from '@deltachat-desktop/runtime-interface'

// same as $default-dialog-width variable in styles
const DEFAULT_WIDTH = 500

type Props = React.PropsWithChildren<{
  onClose?: (result?: any) => void
  /**
   * If {@linkcode canOutsideClickClose} === true or is not provided,
   * this has no effect and acts as `true`.
   */
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
        onClose={onClose}
        closedby={
          canOutsideClickClose
            ? 'any'
            : canEscapeKeyClose
              ? 'closerequest'
              : 'none'
        }
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
