import React, { useEffect, useRef, useState } from 'react'
import MicRecorder from './MicRecorder'
import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export const AudioRecorder = ({
  recording,
  setRecording,
  saveVoiceAsDraft,
}: {
  recording: boolean
  setRecording: (f: boolean) => void
  saveVoiceAsDraft: (blob: Blob) => void
}) => {
  const tx = useTranslationFunction()
  const recorder = useRef<MicRecorder | null>(null)
  if (!recorder.current) {
    recorder.current = new MicRecorder({
      bitRate: 128,
    })
  }

  const [recordingTime, setRecordingTime] = useState(0)

  const minutes = recordingTime / 60
  const secondsDisplay = Math.ceil((minutes - Math.floor(minutes)) * 60)
    .toString()
    .padStart(2, '0')
  const minutesDisplay = Math.floor(minutes).toString().padStart(2, '0')

  useEffect(() => {
    let timer: number | undefined

    if (recording) {
      timer = window.setInterval(() => {
        setRecordingTime((prevTime: number) => prevTime + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (timer) {
        window.clearInterval(timer)
      }
    }
  }, [recording])

  const onRecordingStart = () => {
    setRecording(true)
    recorder.current
      ?.start()
      .then(() => {
        // something else
      })
      .catch((err: any) => {
        console.error(err)
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
  }

  const onRecordingCancel = () => {
    setRecording(false)
    recorder.current?.stop()
  }

  if (!recording) {
    return (
      <button
        className={styles.microphoneButton}
        onClick={() => onRecordingStart()}
      >
        <span />
      </button>
    )
  } else {
    return (
      <div className={styles.recordingDuration}>
        <button
          className={styles.microphoneButton}
          onClick={() => onRecordingStop()}
        >
          <span />
        </button>
        <p>
          {minutesDisplay} : {secondsDisplay}
        </p>
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
