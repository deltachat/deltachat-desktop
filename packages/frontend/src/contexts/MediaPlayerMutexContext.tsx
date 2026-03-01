import React, { createContext, useCallback, useState } from 'react'
import { getLogger } from '@deltachat-desktop/shared/logger'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type runtime } from '@deltachat-desktop/runtime-interface'

const log = getLogger('MediaPlayerMutexContext')

export type MediaPlayerMutexContextValue = {
  /**
   * The string is provided in the form returned from
   * {@linkcode runtime.transformBlobURL}.
   */
  currentSrc: string | null
  eventListeners: {
    onPlay: React.ReactEventHandler<HTMLMediaElement>
    onPause: React.ReactEventHandler<HTMLMediaElement>
    onSeeking: React.ReactEventHandler<HTMLMediaElement>
    onRateChange: React.ReactEventHandler<HTMLMediaElement>
    onVolumeChange: React.ReactEventHandler<HTMLMediaElement>
  }
}

const audioEl = document.createElement('audio')

const noContextErrStr =
  'tried to use MediaPlayerMutexContextValue outside of context provider'
/**
 * A context that facilitates ensuring that only one media element
 * (voice message, etc) plays at a time.
 */
export const MediaPlayerMutexContext =
  createContext<MediaPlayerMutexContextValue>({
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
      onRateChange: () => {
        log.warn(noContextErrStr)
      },
      onVolumeChange: () => {
        log.warn(noContextErrStr)
      },
    },
  })

export function MediaPlayerMutexProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  const setSrcAndPlay = useCallback((newSrc: string | null) => {
    setCurrentSrc(newSrc)

    const newSrcStr = newSrc ?? ''
    if (audioEl.getAttribute('src') !== newSrcStr) {
      audioEl.src = newSrcStr
    }
    audioEl.play()
  }, [])

  return (
    <MediaPlayerMutexContext.Provider
      value={{
        currentSrc,
        eventListeners: {
          // Be careful with `HTMLMediaElement.src` comparisons.
          // `src`'s getter might return a value different from the one you set.
          // Namely, for `.src = '/home/me/vid.mp4`
          // it will be a `file:///...` URL.
          // `getAttribute('src')` returns the value that was provided
          // to the setter, which is what we should always be using
          // for comparisons.
          onPlay: e => setSrcAndPlay(e.currentTarget.getAttribute('src')),
          onPause: e => {
            if (e.currentTarget.getAttribute('src') !== currentSrc) {
              return
            }
            if (e.currentTarget.ended) {
              // The media probably got paused simply because it ended.
              // Let's not manually pause and just let it end naturally,
              // to make sure that we fully play it through.
              return
            }
            audioEl.pause()
          },
          onSeeking: e => {
            if (e.currentTarget.getAttribute('src') !== currentSrc) {
              return
            }
            audioEl.currentTime = e.currentTarget.currentTime
          },
          onRateChange: e => {
            if (e.currentTarget.getAttribute('src') !== currentSrc) {
              return
            }

            audioEl.playbackRate = e.currentTarget.playbackRate
          },
          onVolumeChange: e => {
            if (e.currentTarget.getAttribute('src') !== currentSrc) {
              return
            }

            audioEl.volume = e.currentTarget.volume
            audioEl.muted = e.currentTarget.muted
          },
        },
      }}
    >
      {children}
    </MediaPlayerMutexContext.Provider>
  )
}
