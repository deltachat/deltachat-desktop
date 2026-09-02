import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'

import styles from './styles.module.css'

import type { Toast, ToastPosition } from '../../contexts/ToastContext'

type Props = {
  position: ToastPosition
  toasts: Toast[]
  onExpire: (id: Toast['id']) => void
}

/**
 * Renders all currently visible toasts in the
 * [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer),
 * so that they are visible even while modal dialogs are open.
 *
 * The layer is never interactive (see `pointer-events` in the styles),
 * because it overlaps whatever is below it, including dialog buttons.
 */
export default function ToastLayer({ position, toasts, onExpire }: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  const shownToasts = useRef(new Map<Toast['id'], Toast['shownAt']>())

  useEffect(() => {
    const layer = layerRef.current
    if (layer == null) {
      return
    }

    // A changed `shownAt` means an already displayed toast was shown anew,
    // which should bring it back to the front just like a brand new one.
    const hasNewToast = toasts.some(
      toast => shownToasts.current.get(toast.id) !== toast.shownAt
    )
    shownToasts.current = new Map(
      toasts.map(toast => [toast.id, toast.shownAt])
    )

    const isOpen = layer.matches(':popover-open')
    if (isOpen && !hasNewToast) {
      return
    }
    // Elements of the top layer are painted in the order in which they
    // entered it, and dialogs enter it through `showModal()`.
    // Re-entering it for every new toast is therefore what keeps toasts
    // above dialogs that were opened after this component was mounted.
    if (isOpen) {
      layer.hidePopover()
    }
    layer.showPopover()
  }, [toasts])

  return (
    <div
      ref={layerRef}
      // Not `"auto"`, because those get dismissed on `Escape`
      // and by clicking anywhere.
      popover='manual'
      className={classNames(styles.layer, styles[position])}
      // The layer is kept open (and thus in the accessibility tree)
      // even while empty, so that added toasts are announced.
      role='status'
      aria-atomic='false'
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onExpire={onExpire} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onExpire,
}: { toast: Toast } & Pick<Props, 'onExpire'>) {
  useEffect(() => {
    const timeout = setTimeout(() => onExpire(toast.id), toast.durationMs)
    return () => clearTimeout(timeout)
  }, [toast.id, toast.shownAt, toast.durationMs, onExpire])

  return (
    <div
      className={classNames(styles.toast, styles[toast.position], {
        [styles.error]: toast.type === 'error',
      })}
    >
      {toast.text}
    </div>
  )
}
