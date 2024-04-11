import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { readBarcodesFromImageData, setZXingModuleOverrides } from 'zxing-wasm'

import { ContextMenuContext } from '../../contexts/ContextMenuContext'

import styles from './styles.module.scss'

import type { ContextMenuItem } from '../ContextMenu'
import Icon from '../Icon'
import classNames from 'classnames'
import { Spinner } from '@blueprintjs/core'

type FacingMode = 'user' | 'environment'

type Props = {
  onError: (error: string) => void
  onScan: (data: string) => void
}

const SCAN_QR_INTERVAL_MS = 50

setZXingModuleOverrides({
  // Tell ZXing where the wasm file is located after it got copied there during
  // build process
  locateFile: (path, prefix) => {
    if (path.endsWith('.wasm')) {
      return `./${path}`
    }
    return prefix + path
  },
})

export default function QrReader({ onError, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [facingMode, setFacingMode] = useState<FacingMode>('user')
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
  const [dimensions, setDimensions] = useState({
    width: 640,
    height: 480,
  })

  const { openContextMenu } = useContext(ContextMenuContext)

  const handleSelectDevice = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const [cursorX, cursorY] = [event.clientX, event.clientY]
      const items: ContextMenuItem[] = [
        {
          label: 'Camera',
          subitems: videoDevices.map(device => {
            const marker = device.deviceId === deviceId ? ' ✔' : ''
            return {
              label: `${device.label}${marker}`,
              action: () => {
                setDeviceId(device.deviceId)
              },
            }
          }),
        },
        {
          label: 'Facing Mode',
          subitems: [
            {
              label: `Front${facingMode === 'user' ? ' ✔' : ''}`,
              action: () => {
                setFacingMode('user')
              },
            },
            {
              label: `Back${facingMode === 'environment' ? ' ✔' : ''}`,
              action: () => {
                setFacingMode('environment')
              },
            },
          ],
        },
      ]

      openContextMenu({
        cursorX,
        cursorY,
        items,
      })
    },
    [deviceId, facingMode, openContextMenu, videoDevices]
  )

  const handleError = useCallback(
    (error: any) => {
      if (typeof error === 'string') {
        onError(error)
      } else {
        onError(error.toString())
      }

      setError(true)
    },
    [onError]
  )

  useEffect(() => {
    const getAllCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setVideoDevices(
        devices.filter(device => {
          return device.kind === 'videoinput'
        })
      )
    }

    getAllCameras()
  }, [])

  useEffect(() => {
    let activeStream: MediaStream | undefined
    let unmounted = false

    const video = videoRef.current
    if (!video) {
      return
    }

    const getCamera = async () => {
      const videoConstraints: MediaTrackConstraints = {
        deviceId,
        facingMode,
      }

      try {
        setReady(false)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        })

        if (unmounted) {
          return
        }

        const videoTracks = stream.getVideoTracks()
        if (videoTracks.length === 0) {
          throw new Error('no video tracks given')
        }

        video.srcObject = stream
        activeStream = stream

        const settings = videoTracks[0].getSettings()
        if (settings.deviceId) {
          setDeviceId(settings.deviceId)
        }

        if (settings.width && settings.height) {
          setDimensions({
            width: settings.width,
            height: settings.height,
          })
        }

        setReady(true)
      } catch (error: any) {
        handleError(error)
      }
    }

    getCamera()

    return () => {
      unmounted = true

      if (video) {
        video.srcObject = null
      }

      if (activeStream) {
        for (const track of activeStream.getTracks()) {
          track.stop()
        }
      }

      setReady(false)
      setError(false)
    }
  }, [deviceId, facingMode, handleError])

  useEffect(() => {
    let unmounted = false

    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d', {
      willReadFrequently: true,
      alpha: false,
      desynchronized: true,
    })

    if (!context) {
      return
    }

    const scan = async () => {
      context.drawImage(
        video as CanvasImageSource,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      try {
        const results = await readBarcodesFromImageData(imageData, {
          formats: ['QRCode'],
        })

        if (unmounted) {
          return
        }

        results.forEach(result => {
          onScan(result.text)
        })
      } catch (error: any) {
        handleError(error)
      }
    }

    const interval = window.setInterval(scan, SCAN_QR_INTERVAL_MS)
    return () => {
      unmounted = true
      window.clearInterval(interval)
    }
  }, [handleError, onScan])

  return (
    <div className={styles.qrReader}>
      <div className={classNames(styles.qrReaderStatus, styles.info)}>
        <Spinner />
      </div>
      <canvas
        className={styles.qrReaderCanvas}
        width={dimensions.width}
        height={dimensions.height}
        ref={canvasRef}
      />
      <video
        className={classNames(styles.qrReaderVideo, {
          [styles.visible]: ready && !error,
        })}
        autoPlay
        muted
        disablePictureInPicture
        playsInline
        ref={videoRef}
      />
      {error && (
        <div className={classNames(styles.qrReaderStatus, styles.error)}>
          Error: Could not access video camera
        </div>
      )}
      {videoDevices.length > 0 && (
        <button className={styles.qrReaderButton} onClick={handleSelectDevice}>
          <Icon
            icon='settings'
            size={20}
            className={styles.qrReaderButtonIcon}
          />
        </button>
      )}
    </div>
  )
}
