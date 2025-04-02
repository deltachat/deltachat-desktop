import React, { useEffect, useRef, useState } from 'react'
import MicRecorder from './MicRecorder'
import styles from './styles.module.scss'

type MicRecorderType = {
  start: () => Promise<MediaStream>
  stop: () => MicRecorderType
  getMp3: () => Promise<[buffer: any, blob: any]>
}

export const AudioRecorder = ({
  recording,
  setRecording,
  saveVoiceAsDraft,
}: {
  recording: boolean
  setRecording: (f: boolean) => void
  saveVoiceAsDraft: (blob: Blob) => void
}) => {
  const recorder = useRef<MicRecorderType>(
    new MicRecorder({
      bitRate: 128,
    })
  )
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
        <p>
          {minutesDisplay} : {secondsDisplay}
        </p>
        <button
          className={styles.stopRecording}
          onClick={() => onRecordingStop()}
        >
          Stop
        </button>
      </div>
    )
  }
}
