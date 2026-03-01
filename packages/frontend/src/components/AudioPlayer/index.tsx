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
export function AudioPlayer(
  props: Omit<Props, keyof MediaPlayerMutexContextValue['eventListeners']>
) {
  const ref = useRef<HTMLAudioElement>(null)

  const mediaPlayerMutexCtx = useContext(MediaPlayerMutexContext)

  // When we start playing another media, pause this one.
  useEffect(() => {
    const el = ref.current
    if (el == null) {
      log.error('media element not mounted, cannot pause it')
      return
    }

    if (
      mediaPlayerMutexCtx.currentSrc == null ||
      mediaPlayerMutexCtx.currentSrc !== props.src
    ) {
      return
    }

    return () => {
      el.pause()
      el.currentTime = 0
    }
  }, [mediaPlayerMutexCtx.currentSrc, props.src])

  return (
    // Muted because it's gonna be the <audio> element inside of
    // `MediaPlayerMutexContext` that actually plays the media.
    <ForceMutedAudioPlayer
      ref={ref}
      {...props}
      {...mediaPlayerMutexCtx.eventListeners}
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
