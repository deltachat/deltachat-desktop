import { useEffect, useRef } from 'react'

import type React from 'react'

/**
 * Hook to handle Ctrl+Plus (with fallback to 0), Ctrl+Minus,
 * and Ctrl+0 keyboard shortcuts for zooming.
 * Returns refs to connect to react-zoom-pan-pinch's TransformWrapper utils.
 * Captures and `preventDefault()`s the respective shortcuts,
 * primarily because the same shortcuts are used
 * to change the zoom level of the entire app.
 */
export function useZoomKeyboardShortcuts() {
  const zoomInRef = useRef<(() => void) | null>(null) as React.RefObject<
    (() => void) | null
  >
  const zoomOutRef = useRef<(() => void) | null>(null) as React.RefObject<
    (() => void) | null
  >
  const zoomResetRef = useRef<(() => void) | null>(null) as React.RefObject<
    (() => void) | null
  >

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey) {
        if (ev.key === '+' || ev.key === '=') {
          ev.preventDefault()
          ev.stopPropagation()
          zoomInRef.current?.()
        } else if (ev.key === '-') {
          ev.preventDefault()
          ev.stopPropagation()
          zoomOutRef.current?.()
        } else if (ev.key === '0') {
          ev.preventDefault()
          ev.stopPropagation()
          zoomResetRef.current?.()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  return { zoomInRef, zoomOutRef, zoomResetRef }
}
