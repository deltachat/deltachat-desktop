import React, { useContext } from 'react'
import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { GlobalVoiceMessagePlayerContext } from '../../contexts/GlobalVoiceMessagePlayerContext'
import Icon from '../Icon'
import { NextVoiceMesagePlayerContext } from '../../contexts/NextVoiceMesagePlayerContext'

export function GlobalVoiceMessagePlayer() {
  const tx = useTranslationFunction()

  const singleAudioPlayerCtx = useContext(GlobalVoiceMessagePlayerContext)
  const nextVoiceMessagePlayerCtx = useContext(NextVoiceMesagePlayerContext)

  if (singleAudioPlayerCtx.currentSrc == null) {
    return null
  }

  return (
    <section className={styles.root} aria-label={tx('audio')}>
      <div
        className={styles.audioElContainer}
        // ref={el => el?.append(globalAudioEl)}
        ref={el => el?.append(singleAudioPlayerCtx.audioElement)}
      />
      <button
        className={styles.closeButton}
        type='button'
        aria-label={tx('close')}
        onClick={() => {
          singleAudioPlayerCtx.stop()
          // This is not necessary, but let's do it for good measure.
          nextVoiceMessagePlayerCtx.setCurrMessage(null)
        }}
      >
        <Icon className={styles.closeButtonIcon} icon={'cross'} size={26} />
      </button>
    </section>
  )
}
