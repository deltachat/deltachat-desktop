import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import classNames from 'classnames'

import styles from './styles.module.css'

import type { Toast, ToastPosition } from '../../contexts/ToastContext'

type Props = {
  position: ToastPosition
  toasts: Toast[]
  onExpire: (id: Toast['id']) => void
}

const TOAST_GAP = 8

/**
 * Renders every toast in the
 * [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer),
 * so that they stay visible above modal dialogs.
 *
 * We use Toasts only as a non-interactive notification system
 * notifications might be missed due to the auto-expiration
 *
 * If interaction is needed use a dialog instead
 */
export default function ToastLayer({ position, toasts, onExpire }: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  const shownToasts = useRef(new Map<Toast['id'], Toast['shownAt']>())

  /** Toasts are in the top layer, so they don't stack by themselves. */
  const stack = useCallback(() => {
    let offset = 0
    for (const element of getToastElements(layerRef.current)) {
      element.style.setProperty('--stack-offset', `${offset}px`)
      offset += element.offsetHeight + TOAST_GAP
    }
  }, [])

  useLayoutEffect(() => {
    const elements = getToastElements(layerRef.current)

    // A changed `shownAt` means a displayed toast was shown anew, which
    // should bring it to the front just like a brand new one.
    const hasNewToast = toasts.some(
      toast => shownToasts.current.get(toast.id) !== toast.shownAt
    )
    shownToasts.current = new Map(
      toasts.map(toast => [toast.id, toast.shownAt])
    )

    if (hasNewToast) {
      // The top layer is painted in the order it was entered, and dialogs
      // enter it through `showModal()`, so re-entering keeps toasts above
      // dialogs that were opened after them.
      for (const element of elements) {
        if (element.matches(':popover-open')) {
          element.hidePopover()
        }
        element.showPopover()
      }
    }
    // Closed popovers are `display: none`, so measure only once open.
    stack()
  }, [toasts, stack])

  useEffect(() => {
    // Toasts grow a line when the window gets too narrow for their text.
    const observer = new ResizeObserver(stack)
    for (const element of getToastElements(layerRef.current)) {
      observer.observe(element)
    }
    return () => observer.disconnect()
  }, [toasts, stack])

  return (
    <div
      ref={layerRef}
      className={styles.layer}
      role='status'
      aria-atomic='false'
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          position={position}
          onExpire={onExpire}
        />
      ))}
    </div>
  )
}

function getToastElements(layer: HTMLDivElement | null): HTMLElement[] {
  return layer == null ? [] : (Array.from(layer.children) as HTMLElement[])
}

function ToastItem({
  toast,
  position,
  onExpire,
}: { toast: Toast } & Pick<Props, 'position' | 'onExpire'>) {
  useEffect(() => {
    const timeout = setTimeout(() => onExpire(toast.id), toast.durationMs)
    return () => clearTimeout(timeout)
  }, [toast.id, toast.shownAt, toast.durationMs, onExpire])

  return (
    <div
      // Not `"auto"`, because the notification should stay visible
      // even if the user is interacting with the page
      popover='manual'
      className={classNames(styles.toast, styles[position], {
        [styles.error]: toast.type === 'error',
      })}
    >
      {toast.text}
    </div>
  )
}
