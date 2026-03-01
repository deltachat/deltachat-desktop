import React, { useContext, useEffect, useRef } from 'react'

import styles from './styles.module.scss'
import classNames from 'classnames'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { ForceMutedAudioPlayer } from './ForceMutedAudioPlayer'
import {
  MediaPlayerMutexContext,
  type MediaPlayerMutexContextValue,
} from '../../contexts/MediaPlayerMutexContext'

const log = getLogger('AudioPlayer')

type Props = React.AudioHTMLAttributes<HTMLAudioElement> & {
  src: string
}

/**
 * Mutex-aware audio player. When one player starts playing, others get paused.
 */
export function AudioPlayer({
  onPlayNonProgrammatic,
  ...props
}: Omit<Props, keyof MediaPlayerMutexContextValue['eventListeners']> &
  Pick<Props, 'onPlay' | 'onPause'> & {
    /**
     * `onPlay` that is caused by the user (not programmatic).
     * The regular `play` event might fire as a consequence
     * of us calling `play()`.
     */
    onPlayNonProgrammatic?: React.ReactEventHandler<HTMLMediaElement>
  }) {
  const ref = useRef<HTMLAudioElement>(null)

  const mediaPlayerMutexCtx = useContext(MediaPlayerMutexContext)

  const ignoreOnePlayEvent = useRef(false)
  const ignoreOnePauseEvent = useRef(false)

  // When we start playing another media, pause this one.
  //
  // Also mirror the `paused` state of the global audio element.
  useEffect(() => {
    const el = ref.current
    if (el == null) {
      log.error('media element not mounted, cannot pause it')
      return
    }
    const globalEl = mediaPlayerMutexCtx.audioElement

    if (
      mediaPlayerMutexCtx.currentSrc == null ||
      mediaPlayerMutexCtx.currentSrc !== props.src
    ) {
      return
    }

    // This is very primitive syncing. Only the `paused` state,
    // no regard for `currentTime`, `playbackRate` etc.
    // But it's good enough for a start.
    const onPlayGlobal = () => {
      if (el.paused) {
        el.play()
        ignoreOnePlayEvent.current = true
      }
    }
    const onPauseGlobal = () => {
      if (!el.paused) {
        el.pause()
        ignoreOnePauseEvent.current = true
      }
    }
    if (!globalEl.paused) {
      onPlayGlobal()
    }
    globalEl.addEventListener('play', onPlayGlobal)
    globalEl.addEventListener('pause', onPauseGlobal)

    return () => {
      el.pause()
      el.currentTime = 0

      globalEl.removeEventListener('play', onPlayGlobal)
      globalEl.removeEventListener('pause', onPauseGlobal)
    }
  }, [
    mediaPlayerMutexCtx.audioElement,
    mediaPlayerMutexCtx.currentSrc,
    props.src,
  ])

  return (
    // Muted because it's gonna be the <audio> element inside of
    // `MediaPlayerMutexContext` that actually plays the media.
    <ForceMutedAudioPlayer
      ref={ref}
      {...props}
      {...mediaPlayerMutexCtx.eventListeners}
      onPlay={e => {
        props.onPlay?.(e)
        if (!ignoreOnePlayEvent.current) {
          onPlayNonProgrammatic?.(e)
          mediaPlayerMutexCtx.eventListeners.onPlay(e)
        }
        ignoreOnePlayEvent.current = false
      }}
      onPause={e => {
        props.onPause?.(e)
        if (!ignoreOnePauseEvent.current) {
          mediaPlayerMutexCtx.eventListeners.onPause(e)
        }
        ignoreOnePauseEvent.current = false
      }}
    />
  )
}

export function AudioPlayerNonMutex({
  ref,
  className,
  ...restProps
}: Props & {
  ref?: React.RefObject<HTMLAudioElement | null>
}) {
  return (
    <audio
      ref={ref}
      controls
      className={classNames(styles.audioPlayer, className)}
      {...restProps}
    />
  )
}
