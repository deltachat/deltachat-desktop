import React, { createContext, useCallback, useMemo, useState } from 'react'

import type { PropsWithChildren } from 'react'

import ToastLayer from '../components/Toast/ToastLayer'
import { generateRandomUUID } from '../utils/random'

export type ToastType = 'info' | 'error'

/** The edge of the window that the toast appears at. */
export type ToastPosition = 'top' | 'bottom'

export type Toast = {
  id: string
  text: string
  type: ToastType
  durationMs: number
  position: ToastPosition
  /** Set anew every time the toast's display duration is restarted. */
  shownAt: number
}

export type ShowToast = (
  text: string,
  options?: {
    type?: ToastType
    durationMs?: number
    position?: ToastPosition
  }
) => void

const DEFAULT_DURATION_MS = 4000
/** Older toasts are dropped, so that the screen can't be covered by them. */
const MAX_VISIBLE_TOASTS = 3

type ToastContextValue = {
  /**
   * Show a short, non-interactive message that disappears on its own.
   *
   * Showing a message that is already displayed doesn't add a second
   * toast, it restarts the display duration of the existing one.
   */
  showToast: ShowToast
}

export const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
})

export const ToastContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: Toast['id']) => {
    setToasts(toasts => toasts.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback<ShowToast>(
    (
      text,
      { type = 'info', durationMs = DEFAULT_DURATION_MS, position = 'top' } = {}
    ) => {
      const newToast: Toast = {
        id: generateRandomUUID(),
        text,
        type,
        durationMs,
        position,
        shownAt: Date.now(),
      }
      setToasts(toasts => {
        // Repeating the action that caused a toast shouldn't show another
        // toast with the same message. The one that is still displayed
        // takes over the new toast's properties instead, which also
        // restarts its display duration.
        const displayed = toasts.find(toast => toast.text === text)
        if (displayed != null) {
          return toasts.map(toast =>
            toast === displayed ? { ...newToast, id: displayed.id } : toast
          )
        }
        return [...toasts, newToast].slice(-MAX_VISIBLE_TOASTS)
      })
    },
    []
  )

  const topToasts = useMemo(
    () => toasts.filter(toast => toast.position === 'top'),
    [toasts]
  )
  const bottomToasts = useMemo(
    () => toasts.filter(toast => toast.position === 'bottom'),
    [toasts]
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastLayer position='top' toasts={topToasts} onExpire={removeToast} />
      <ToastLayer
        position='bottom'
        toasts={bottomToasts}
        onExpire={removeToast}
      />
    </ToastContext.Provider>
  )
}
