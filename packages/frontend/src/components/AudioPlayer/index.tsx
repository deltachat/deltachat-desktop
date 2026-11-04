import React, { useContext, useEffect, useRef } from 'react'

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
  const ignoreOneSeekingEvent = useRef(false)
  const ignoreOneRateChangeEvent = useRef(false)
  /**
   * A counter and not a boolean, because changing both `volume` and `muted`
   * fires two `volumechange` events.
   */
  const ignoreVolumeChangeEvents = useRef(0)

  // Sync this player's state to the global one.
  useEffect(() => {
    const el = ref.current
    if (el == null) {
      log.error(
        'media element not mounted, cannot sync it to the global player'
      )
      return
    }
    const globalEl = mediaPlayerMutexCtx.audioElement

    if (
      mediaPlayerMutexCtx.currentSrc == null ||
      mediaPlayerMutexCtx.currentSrc !== props.src
    ) {
      return
    }

    // This probably doesn't sync perfectly, but good enough.
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
    const onSeekingGlobal = () => {
      if (el.currentTime === globalEl.currentTime) {
        return
      }
      el.currentTime = globalEl.currentTime
      ignoreOneSeekingEvent.current = true
    }
    const onRateChangeGlobal = () => {
      if (el.playbackRate === globalEl.playbackRate) {
        return
      }
      el.playbackRate = globalEl.playbackRate
      ignoreOneRateChangeEvent.current = true
    }
    const onVolumeChangeGlobal = () => {
      if (el.volume !== globalEl.volume) {
        el.volume = globalEl.volume
        ignoreVolumeChangeEvents.current++
      }

      if (el.muted !== globalEl.muted) {
        el.muted = globalEl.muted
        ignoreVolumeChangeEvents.current++
      }
    }

    onSeekingGlobal()
    onRateChangeGlobal()
    onVolumeChangeGlobal()
    if (!globalEl.paused) {
      onPlayGlobal()
    }
    globalEl.addEventListener('play', onPlayGlobal)
    globalEl.addEventListener('pause', onPauseGlobal)
    globalEl.addEventListener('seeking', onSeekingGlobal)
    globalEl.addEventListener('ratechange', onRateChangeGlobal)
    globalEl.addEventListener('volumechange', onVolumeChangeGlobal)

    return () => {
      el.pause()
      el.currentTime = 0

      globalEl.removeEventListener('play', onPlayGlobal)
      globalEl.removeEventListener('pause', onPauseGlobal)
      globalEl.removeEventListener('seeking', onSeekingGlobal)
      globalEl.removeEventListener('ratechange', onRateChangeGlobal)
      globalEl.removeEventListener('volumechange', onVolumeChangeGlobal)
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
      onSeeking={e => {
        if (!ignoreOneSeekingEvent.current) {
          mediaPlayerMutexCtx.eventListeners.onSeeking(e)
        }
        ignoreOneSeekingEvent.current = false
      }}
      onRateChange={e => {
        if (!ignoreOneRateChangeEvent.current) {
          mediaPlayerMutexCtx.eventListeners.onRateChange(e)
        }
        ignoreOneRateChangeEvent.current = false
      }}
      onVolumeChange={e => {
        if (ignoreVolumeChangeEvents.current > 0) {
          ignoreVolumeChangeEvents.current--
          return
        }
        mediaPlayerMutexCtx.eventListeners.onVolumeChange(e)
      }}
    />
  )
}
