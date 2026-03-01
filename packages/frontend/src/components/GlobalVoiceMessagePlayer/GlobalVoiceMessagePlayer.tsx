import React, { useContext } from 'react'
import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { MediaPlayerMutexContext } from '../../contexts/MediaPlayerMutexContext'
import Icon from '../Icon'
import { NextVoiceMessagePlayerContext } from '../../contexts/NextVoiceMessagePlayerContext'

export function GlobalVoiceMessagePlayer() {
  const tx = useTranslationFunction()

  const mediaPlayerMutexCtx = useContext(MediaPlayerMutexContext)
  const nextVoiceMessagePlayerCtx = useContext(NextVoiceMessagePlayerContext)

  if (mediaPlayerMutexCtx.currentSrc == null) {
    return null
  }

  return (
    <section className={styles.root} aria-label={tx('audio')}>
      <div
        className={styles.audioElContainer}
        ref={el => el?.append(mediaPlayerMutexCtx.audioElement)}
      />
      <button
        className={styles.closeButton}
        type='button'
        aria-label={tx('close')}
        onClick={() => {
          mediaPlayerMutexCtx.stop()
          // Functionality-wise this is not necessary, but let's do it
          // for good measure.
          nextVoiceMessagePlayerCtx.setCurrMessage(null)
        }}
      >
        <Icon className={styles.closeButtonIcon} icon={'cross'} size={26} />
      </button>
    </section>
  )
}
