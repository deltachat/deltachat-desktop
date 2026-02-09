import React, { createContext, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type GlobalPlayerContextValue = {
  // TODO rename
  ref: React.RefCallback<HTMLElement>
  // src: string | null
  // setSrc: (src: GlobalPlayerContextValue['src']) => void
  setSrc: (src: string | null) => void
}

// const initialValue = {
// }

export const GlobalVoiceMessagePlayerContext =
  createContext<GlobalPlayerContextValue>({
    ref: () => {},
    // src: null,
    setSrc: () => {},
  })

export function GlobalVoiceMessagePlayerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const audioElRef = useRef<HTMLAudioElement>(null)
  const [audioElContainer, setAudioElContainer] = useState<null | HTMLElement>(
    null
  )
  // const [src, setSrc] = useState<null | string>(null)
  const setSrcAndPlay = useCallback((newSrc: string | null) => {
    // TODO this should probably be less imperative?
    if (audioElRef.current == null) {
      return
    }
    audioElRef.current.src = newSrc ?? ''
    audioElRef.current.play()
  }, [])

  return (
    <GlobalVoiceMessagePlayerContext.Provider
      value={{ ref: setAudioElContainer, setSrc: setSrcAndPlay }}
      // value={{ ref: () => {} }}
    >
      {children}

      {audioElContainer &&
        // createPortal(<audio src={src ?? undefined} />, audioElContainer)}
        createPortal(<audio controls ref={audioElRef} />, audioElContainer)}
    </GlobalVoiceMessagePlayerContext.Provider>
  )
}
