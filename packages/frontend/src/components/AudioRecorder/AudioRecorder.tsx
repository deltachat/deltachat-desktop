import React, { useCallback, useEffect, useRef, useState } from 'react'
import MicRecorder from './MicRecorder'
import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { runtime } from '@deltachat-desktop/runtime-interface'
import useDialog from '../../hooks/dialog/useDialog'
import AlertDialog from '../dialogs/AlertDialog'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/AudioRecorder')

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
 * shows a timer in format MM:SS
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
    <div role='timer'>
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
  // doubling the volume shows a more realistic volume level
  const level = Math.min(prop.volume * 2, 1)
  const levelPercentage = `${(1 - level) * 100}%`

  return (
    <div
      role='meter'
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={level}
      className={styles.volumeBarContainer}
    >
      <div className={styles.volumeBar}>
        <div className={styles.mask}>
          {Array.from({ length: steps }).map((_, index) => (
            <div key={index} className={styles.step} />
          ))}
        </div>
        <div className={styles.level} style={{ width: levelPercentage }} />
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
  const { openDialog } = useDialog()

  const onAccessDenied = useCallback(() => {
    openDialog(AlertDialog, {
      message: tx('perm_explain_access_to_mic_denied'),
    })
  }, [openDialog, tx])

  const onRecordingStart = async () => {
    let access = 'unknown'
    try {
      access = await runtime.checkMediaAccess('microphone')
      log.debug('checkMediaAccess', { access })
      if (access === 'denied') {
        onAccessDenied()
        return
      }
      if (access === 'not-determined') {
        // try to ask for access
        const accessAllowed = await runtime.askForMediaAccess('microphone')
        if (accessAllowed === false) {
          onAccessDenied()
          return
        }
      }
    } catch (err: any) {
      log.error('failed to check or request media permission', err)
      onError(new AudioRecorderError(err.message))
      return
    }

    if (!recorder.current) {
      recorder.current = new MicRecorder(setVolume, {
        bitRate: 32,
      })
    }
    setRecording(true)
    recorder.current
      ?.start()
      .then(() => {
        window.setTimeout(() => {
          if (!recorder.current?.audioSignalDetected && recording) {
            onError(new AudioRecorderError('No input', AudioErrorType.NO_INPUT))
            onRecordingCancel()
          }
        }, 1000)
      })
      .catch((err: any) => {
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
        saveVoiceAsDraft(new Blob(buffer as any, { type: 'audio/mp3' }))
      })
      .catch((err: any) => {
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

  useEffect(() => {
    if (!recording) {
      // make sure recorder is stopped when still running
      recorder.current?.stop()
    }
  }, [recording])

  if (!recording) {
    return (
      <button
        type='button'
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
          type='button'
          className={styles.microphoneButton}
          onClick={() => onRecordingStop()}
          aria-label={tx('stop_recording')}
        >
          <span />
        </button>
        <Timer />
        <VolumeMeter volume={volume} />
        <button
          type='button'
          className={styles.cancel}
          onClick={() => onRecordingCancel()}
        >
          {tx('cancel')}
        </button>
        <button
          type='button'
          className={styles.stopRecording}
          onClick={() => onRecordingStop()}
          aria-description={tx('stop_recording')}
        >
          {tx('ok')}
        </button>
      </div>
    )
  }
}
