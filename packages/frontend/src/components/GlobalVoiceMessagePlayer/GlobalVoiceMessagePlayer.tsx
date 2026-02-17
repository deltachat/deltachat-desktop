import React, { useContext } from 'react'
import { GlobalVoiceMessagePlayerContext } from '../../contexts/GlobalVoiceMessagePlayerContext'

export function GlobalVoiceMessagePlayer() {
  const ctx = useContext(GlobalVoiceMessagePlayerContext)

  return (
    // <div ref={ctx.ref}>
    <div ref={(el) => ctx.ref(el)}>
        
    </div>
  )
}
