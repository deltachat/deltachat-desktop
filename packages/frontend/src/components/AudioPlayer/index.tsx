import React, { useContext, useEffect, useRef } from 'react'

import styles from './styles.module.scss'
import classNames from 'classnames'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { AudioPlayerNoGlobalMuteable } from './AudioPlayerMuteable'
import { GlobalVoiceMessagePlayerContext } from '../../contexts/GlobalVoiceMessagePlayerContext'

const log = getLogger('AudioPlayer')

type Props = React.AudioHTMLAttributes<HTMLAudioElement> & {
  src: string
}

/**
 * Global-aware audio player. When one player starts playing, others get paused.
 *
 * Doesn't support event listeners.
 */
export function AudioPlayer(props: Props) {
  const ref = useRef<HTMLAudioElement>(null)

  const globalPlayerCtx = useContext(GlobalVoiceMessagePlayerContext)

  // When we start playing another media, pause this one.
  useEffect(() => {
    const el = ref.current
    if (el == null) {
      log.error('media element not mounted, cannot pause it')
      return
    }

    if (
      globalPlayerCtx.currentSrc == null ||
      globalPlayerCtx.currentSrc !== el.currentSrc
    ) {
      return
    }

    return () => {
      el.pause()
      el.currentTime = 0
    }
  }, [globalPlayerCtx.currentSrc])

  return (
    <AudioPlayerNoGlobalMuteable
      ref={ref}
      // Muted because it's gonna be the global player
      // that actually plays the media.
      forceMute
      {...props}
      {...globalPlayerCtx.eventListeners}
    />
  )
}

export function AudioPlayerNoGlobal({ className, ...restProps }: Props) {
  return (
    <audio
      controls
      className={classNames(styles.audioPlayer, className)}
      {...restProps}
    />
  )
}
