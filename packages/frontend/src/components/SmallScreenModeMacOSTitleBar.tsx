import React, { useEffect, useState } from 'react'
import { appWindowTitle } from '../../../shared/constants'

/** because the window is borderless and the traffic lights hover over the document on MacOS,
 *  we need some more space so the traffic lights (close, minimize fullscreen buttons)
 *  do not overlay over the content, this bar is a spacer. */
export function SmallScreenModeMacOSTitleBar() {
  const [hasFocus, setHasFocus] = useState(true)

  useEffect(() => {
    const updateIsFocused = () => setHasFocus(document.hasFocus())

    window.addEventListener('focus', updateIsFocused)
    window.addEventListener('blur', updateIsFocused)
    return () => {
      window.removeEventListener('focus', updateIsFocused)
      window.removeEventListener('blur', updateIsFocused)
    }
  }, [])

  return (
    <div
      style={{
        height: '26px',
        lineHeight: '26px',
        textAlign: 'center',
        flexShrink: 0,
        flexGrow: 0,
        backgroundColor: '#2c2c2c',
        color: hasFocus ? '#d2d2d2' : '#565656',
        fontWeight: 'bold',
      }}
      data-tauri-drag-region
    >
      {appWindowTitle}
    </div>
  )
}
