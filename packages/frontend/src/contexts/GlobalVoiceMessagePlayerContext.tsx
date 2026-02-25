import { getLogger } from '@deltachat-desktop/shared/logger'
import React, { createContext, useCallback, useState } from 'react'

const log = getLogger('GlobalVoiceMessagePlayerContext')

type GlobalPlayerContextValue = {
  currentSrc: string | null
  eventListeners: {
    onPlay: React.ReactEventHandler<HTMLMediaElement>
    onPause: React.ReactEventHandler<HTMLMediaElement>
    onSeeking: React.ReactEventHandler<HTMLMediaElement>
    onVolumeChange: React.ReactEventHandler<HTMLMediaElement>
  }
}

const audioEl = document.createElement('audio')
audioEl.controls = true

const noContextErrStr =
  'tried to use GlobalPlayerContextValue outside of context provider'
/**
 * A context that facilitates ensuring that only one media element
 * (voice message, etc) plays at a time.
 */
export const GlobalVoiceMessagePlayerContext =
  createContext<GlobalPlayerContextValue>({
    currentSrc: null,
    eventListeners: {
      onPlay: () => {
        log.warn(noContextErrStr)
      },
      onPause: () => {
        log.warn(noContextErrStr)
      },
      onSeeking: () => {
        log.warn(noContextErrStr)
      },
      onVolumeChange: () => {
        log.warn(noContextErrStr)
      },
    },
  })

export function GlobalVoiceMessagePlayerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  const setSrcAndPlay = useCallback((newSrc: string | null) => {
    setCurrentSrc(newSrc)

    if (audioEl == null) {
      return
    }

    const newSrcStr = newSrc ?? ''
    if (audioEl.src !== newSrcStr) {
      audioEl.src = newSrcStr
    }
    audioEl.play()
  }, [])

  return (
    <GlobalVoiceMessagePlayerContext.Provider
      value={{
        currentSrc,
        eventListeners: {
          onPlay: e => setSrcAndPlay(e.currentTarget.src),
          // Be careful with `HTMLMediaElement.src` comparisons.
          // `src`'s getter might return a value different from the one you set.
          // Namely, for `.src = '/home/me/vid.mp4`
          // it will be a `file:///...` URL.
          // Note that `getAttribute()` can work around that,
          // but we don't do it.
          onPause: e => {
            if (e.currentTarget.src !== audioEl.src) {
              return
            }
            if (
              e.currentTarget.ended
              // && audioEl.duration - audioEl.currentTime < 3
            ) {
              // The media probably got paused simply because it ended.
              // Let's not manually pause and just let it end naturally,
              // to make sure that we fully play it through.
              return
            }
            audioEl.pause()
          },
          onSeeking: e => {
            if (e.currentTarget.src !== audioEl.src) {
              return
            }
            audioEl.currentTime = e.currentTarget.currentTime
          },
          onVolumeChange: e => {
            if (e.currentTarget.src !== audioEl.src) {
              return
            }

            audioEl.volume = e.currentTarget.volume
            audioEl.muted = e.currentTarget.muted
          },
        },
      }}
    >
      {children}
    </GlobalVoiceMessagePlayerContext.Provider>
  )
}
