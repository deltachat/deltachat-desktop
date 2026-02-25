import React, { createContext, useState } from 'react'
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
  }
}

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
    },
  })

export function MediaPlayerMutexProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

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
          onPlay: e => setCurrentSrc(e.currentTarget.getAttribute('src')),
        },
      }}
    >
      {children}
    </MediaPlayerMutexContext.Provider>
  )
}
