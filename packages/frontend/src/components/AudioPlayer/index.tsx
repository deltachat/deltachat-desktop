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
 * Doesn't support event listeners. TODO not true anymore
 */
export function AudioPlayer(props: Props) {
  const ref = useRef<HTMLAudioElement>(null)

  const globalPlayerCtx = useContext(GlobalVoiceMessagePlayerContext)
  // const src = useMemo(() => runtime.transformBlobURL(props.file), [props.file])

  // const prevGlobalSrc = usePrevious2(globalPlayerCtx.currentSrc)
  // if (useHasChanged2(globalPlayerCtx.currentSrc)) {
  // if (useHasChanged2(globalPlayerCtx.currentSrc)) {
  // }

  // // When we switch to another media, pause the previous one.
  // const pauseIfDifferentSrc = useEffectEvent(() => {
  //   if (ref.current == null) {
  //     return
  //   }
  //   if (
  //     globalPlayerCtx.currentSrc != null &&
  //     ref.current.src !== globalPlayerCtx.currentSrc
  //   ) {
  //     ref.current.pause()
  //     ref.current.currentTime = 0
  //   }
  // })
  // useEffect(() => {
  //   return () => {
  //     pauseIfDifferentSrc()
  //   }
  // }, [globalPlayerCtx.currentSrc])

  // TODO rename. We ignore only for the global player.
  const ignoreOnePlayEvent = useRef(false)
  const ignoreOnePauseEvent = useRef(false)

  // When we start playing another media, pause this one.
  useEffect(() => {
    const el = ref.current
    if (el == null) {
      log.error('media element not mounted, cannot pause it')
      return
    }

    if (
      globalPlayerCtx.currentSrc == null ||
      // globalPlayerCtx.currentSrc !== el.currentSrc
      // globalPlayerCtx.currentSrc !== el.getAttribute('src')
      globalPlayerCtx.currentSrc !== props.src
    ) {
      return
    }

    // TODO maybe this logic should be inside the context.
    // TODO this doesn't work if we mount when the element is playing already.
    // We need it to pass state I think.
    // TODO this is very primitive syncing. Only the "playing" state,
    // no regard for `currentTime` etc.
    // Needs to be writtern from scratch ideally.
    const onPlayGlobal = () => {
      if (el.paused) {
        el.play()
        ignoreOnePlayEvent.current = true

        // // This is racey
        // setTimeout(() => {
        //   ignoreOnePlayEvent.current = false
        // })
      }
      // TODO also set `currentTime`, and ignore `seek` event.
    }
    const onPauseGlobal = () => {
      if (!el.paused) {
        el.pause()
        ignoreOnePauseEvent.current = true
        // setTimeout(() => {
        //   ignoreOnePauseEvent.current = false
        // })
      }
    }
    if (!globalPlayerCtx.audioElement.paused) {
      onPlayGlobal()
    }
    globalPlayerCtx.audioElement.addEventListener('play', onPlayGlobal)
    globalPlayerCtx.audioElement.addEventListener('pause', onPauseGlobal)

    return () => {
      // if (ref.current == null) {
      //   return
      // }
      // if (ref.current.src === globalPlayerCtx.currentSrc) {
      //   ref.current.pause()
      //   ref.current.currentTime = 0
      // }

      el.pause()
      el.currentTime = 0

      globalPlayerCtx.audioElement.removeEventListener('play', onPlayGlobal)
      globalPlayerCtx.audioElement.removeEventListener('pause', onPauseGlobal)
    }
  }, [globalPlayerCtx.audioElement, globalPlayerCtx.currentSrc, props.src])

  return (
    <AudioPlayerNoGlobalMuteable
      ref={ref}
      // Muted because it's gonna be the global player
      // that actually plays the media.
      forceMute
      {...props}
      {...globalPlayerCtx.eventListeners}
      // TODO do for all events
      onPlay={e => {
        props.onPlay?.(e)
        if (!ignoreOnePlayEvent.current) {
          globalPlayerCtx.eventListeners.onPlay(e)
        }
        ignoreOnePlayEvent.current = false
      }}
      onPause={e => {
        props.onPause?.(e)
        if (!ignoreOnePauseEvent.current) {
          globalPlayerCtx.eventListeners.onPause(e)
        }
        ignoreOnePauseEvent.current = false
      }}

      // onVolumeChange={e => {
      //   ctx.eventListeners.onVolumeChange(e)
      //   // This will make it muted again, without changing `.volume`.
      //   e.currentTarget.muted = true
      // }}
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
