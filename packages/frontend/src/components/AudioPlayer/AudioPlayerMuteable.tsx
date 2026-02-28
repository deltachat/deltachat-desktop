import React, { useEffect, useRef } from 'react'
import styles from './styles.module.scss'
import classNames from 'classnames'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('AudioPlayerMuteable')

type Props = React.AudioHTMLAttributes<HTMLAudioElement> & {
  ref?: React.RefObject<HTMLAudioElement | null>
  /**
   * Pretty much the same as `muted`, but this doesn't make the element
   * muted _visually_. So the user can still control the volume
   * and the regular `muted` state, but the element will not make sound
   * no matter what.
   */
  forceMute?: boolean
}

const dummyAudioContext = new AudioContext({
  // Use the most relaxed setting, for performance.
  // This audio context is not going to output any audio anyway.
  latencyHint: 'playback',
})
dummyAudioContext.suspend()
const zeroGain = dummyAudioContext.createGain()
zeroGain.gain.value = 0
zeroGain.connect(dummyAudioContext.destination)

/**
 * Note that playing media elements are not eligible for GC anyway,
 * so it's fine to store references to them.
 */
const playingElements = new Set<HTMLMediaElement>()
const checkPaused = (el: HTMLMediaElement) => {
  if (el.paused) {
    playingElements.delete(el)
  } else {
    playingElements.add(el)
  }

  if (playingElements.size > 0) {
    log.debug(
      `${playingElements.size} elements are playing, resuming AudioContext`
    )

    dummyAudioContext.resume()
  } else {
    log.debug(
      'No elements are playing, suspending AudioContext so as to not consume system resources'
    )

    dummyAudioContext.suspend()
  }
}
const checkPaused2 = (event: Event) => {
  if (!(event.target instanceof HTMLMediaElement)) {
    throw new Error(
      "Can't check if the element is paused: it's not a media element"
    )
  }
  checkPaused(event.target)
}

/**
 * Generic audio player with no "global media player" awareness,
 * that supports `forceMute`.
 */
export function AudioPlayerNoGlobalMuteable({
  ref: refProp,
  className,
  forceMute,
  ...restProps
}: Props) {
  const ref2 = useRef<HTMLAudioElement>(null)
  const ref = refProp ?? ref2

  useEffect(() => {
    if (ref.current == null) {
      return
    }
    checkPaused(ref.current)
    ref.current.addEventListener('play', checkPaused2)
    ref.current.addEventListener('pause', checkPaused2)
  }, [ref])

  useEffect(() => {
    if (forceMute) {
      if (ref.current == null) {
        throw new Error("Media element is not mounted, can't mute it")
      }

      const src = dummyAudioContext.createMediaElementSource(ref.current)
      // The element's `currentTime` would be stuck
      // if we didn't actually connect the element to the audio output.
      // So let's do that, but through a "mute" node.
      src.connect(zeroGain)
    }
  }, [forceMute, ref])

  return (
    <audio
      ref={ref}
      controls
      className={classNames(styles.audioPlayer, className)}
      {...restProps}
    />
  )
}
