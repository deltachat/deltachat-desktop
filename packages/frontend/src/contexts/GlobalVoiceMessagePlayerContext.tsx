import { getLogger } from '@deltachat-desktop/shared/logger'
import React, { createContext, useCallback, useRef, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type runtime } from '@deltachat-desktop/runtime-interface'

const log = getLogger('GlobalVoiceMessagePlayerContext')

type GlobalPlayerContextValue = {
  /**
   * This never changes
   */
  audioElement: HTMLAudioElement
  /**
   * The string is provided in the form returned from
   * {@linkcode runtime.transformBlobURL}.
   */
  currentSrc: string | null
  eventListeners: {
    onPlay: React.ReactEventHandler<HTMLMediaElement>
    onPause: React.ReactEventHandler<HTMLMediaElement>
    onSeeking: React.ReactEventHandler<HTMLMediaElement>
    onVolumeChange: React.ReactEventHandler<HTMLMediaElement>
  }
  /**
   * Same as {@linkcode GlobalPlayerContextValue.eventListeners['onPlay']},
   * but takes only `src` instead of an entire event.
   */
  onPlay2: (src: string) => void

  // Only needed for the "close" button of the global player UI.
  stop: () => void
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
    audioElement: audioEl,
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
    onPlay2: () => {
      log.warn(noContextErrStr)
    },
    stop: () => {
      log.warn(noContextErrStr)
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
    if (audioEl.getAttribute('src') !== newSrcStr) {
      audioEl.src = newSrcStr
    }
    audioEl.play()
    // TODO fix: also sync `currentTime` if the element started playing
    // not from the start.
  }, [])

  return (
    <GlobalVoiceMessagePlayerContext.Provider
      value={{
        audioElement: audioEl,
        currentSrc,
        eventListeners: {
          onPlay: e => setSrcAndPlay(e.currentTarget.getAttribute('src')),
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
        onPlay2: setSrcAndPlay,
        stop: useCallback(() => {
          setCurrentSrc(null)
          audioEl.src = ''
        }, [])
      }}
    >
      {children}
    </GlobalVoiceMessagePlayerContext.Provider>
  )
}
