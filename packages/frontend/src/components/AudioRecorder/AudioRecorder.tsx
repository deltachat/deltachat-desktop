import React, { useCallback, useEffect, useRef, useState } from 'react'
import MicRecorder from './MicRecorder'
import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export enum AudioErrorType {
  'NO_INPUT',
  'OTHER_ERROR',
}

export class AudioRecorderError extends Error {
  public errorType: AudioErrorType
  constructor(message: string, type = AudioErrorType.OTHER_ERROR) {
    super(message)
    this.errorType = type
  }
}

/**
 * shows a timer in format seconds:minutes
 */
const Timer = () => {
  const [recordingTime, setRecordingTime] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const minutes = Math.floor(recordingTime / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (recordingTime % 60).toString().padStart(2, '0')

  return (
    <div>
      <p>
        {minutes}:{seconds}
      </p>
    </div>
  )
}

/**
 * Show a volume meter by stacking 3 div layers
 * 1. a mask to show a grid of steps
 * 2. a level layer to show/hide the coloured background
 * 3. a coloured background with a color gradient from green to red
 */
const VolumeMeter = (prop: { volume: number }) => {
  const steps = 10
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const totalWidth = Number(volumeBarRef.current?.clientWidth) || 0
  // doubling the volume shows a more realistic volume level
  const level = Math.min(totalWidth * prop.volume * 2, totalWidth)
  const levelWidth = totalWidth > 0 ? `${totalWidth - level}px` : '100%'
  console.debug(`volume: ${(prop.volume * 100).toFixed(2)}%`)
  return (
    <div className={styles.volumeBarContainer}>
      <div className={styles.volumeBar}>
        <div ref={volumeBarRef} className={styles.mask}>
          {Array.from({ length: steps }).map((_, index) => (
            <div key={index} className={styles.step} />
          ))}
        </div>
        <div className={styles.level} style={{ width: `${levelWidth}` }} />
        <div className={styles.colorBackground} />
      </div>
    </div>
  )
}

export const AudioRecorder = ({
  recording,
  setRecording,
  saveVoiceAsDraft,
  onError,
}: {
  recording: boolean
  setRecording: (f: boolean) => void
  saveVoiceAsDraft: (blob: Blob) => void
  onError: (error: AudioRecorderError) => void
}) => {
  const tx = useTranslationFunction()
  const [volume, setVolume] = useState(0)
  const recorder = useRef<MicRecorder | null>(null)

  const onRecordingStart = () => {
    if (!recorder.current) {
      recorder.current = new MicRecorder(setVolume, {
        bitRate: 128,
      })
    }
    setRecording(true)
    recorder.current
      ?.start()
      .then(() => {
        window.setTimeout(() => {
          if (!recorder.current?.audioSignalDetected) {
            onError(new AudioRecorderError('No input', AudioErrorType.NO_INPUT))
            onRecordingCancel()
          }
        }, 1000)
      })
      .catch((err: any) => {
        console.error(err)
        onError(new AudioRecorderError(err.message))
        setRecording(false)
      })
  }
  const onRecordingStop = () => {
    setRecording(false)
    recorder.current
      ?.stop()
      .getMp3()
      .then(([buffer, _blob]) => {
        saveVoiceAsDraft(new Blob(buffer, { type: 'audio/mp3' }))
      })
      .catch((err: any) => {
        console.error(err)
        onError(new AudioRecorderError(err.message))
      })
  }

  const onRecordingCancel = useCallback(() => {
    setRecording(false)
    recorder.current?.stop()
  }, [setRecording])

  useEffect(() => {
    return () => {
      onRecordingCancel()
    }
  }, [onRecordingCancel])

  if (!recording) {
    // make sure recorder is stopped when still running
    recorder.current?.stop()
    return (
      <button
        aria-label={tx('voice_send')}
        className={styles.microphoneButton}
        onClick={() => onRecordingStart()}
      >
        <span />
      </button>
    )
  } else {
    return (
      <div className={styles.audioRecorder}>
        <button
          className={styles.microphoneButton}
          onClick={() => onRecordingStop()}
        >
          <span />
        </button>
        <Timer />
        <VolumeMeter volume={volume} />
        <button className={styles.cancel} onClick={() => onRecordingCancel()}>
          {tx('cancel')}
        </button>
        <button
          className={styles.stopRecording}
          onClick={() => onRecordingStop()}
        >
          {tx('ok')}
        </button>
      </div>
    )
  }
}
