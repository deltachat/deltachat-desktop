import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'

import Icon from '../Icon'
import Spinner from '../Spinner'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { runtime } from '@deltachat-desktop/runtime-interface'

import { qrCodeFromImage, qrCodeFromClipboard } from './helper'

// @ts-ignore:next-line: We're importing a worker here with the help of the
// "esbuild-plugin-inline-worker" plugin
import QrWorker from './qr.worker'

import styles from './styles.module.scss'

import type { ContextMenuItem } from '../ContextMenu'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'

type Props = {
  onError: (error: string) => void
  onScanSuccess: (data: string) => void
}

/**
 * How long to idle between scan operations
 */
const SCAN_QR_INTERVAL_MS = 1000 / 30

const worker = new QrWorker() as Worker

export default function QrReader({ onError, onScanSuccess }: Props) {
  const tx = useTranslationFunction()
  const { openContextMenu } = useContext(ContextMenuContext)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<OffscreenCanvas>(new OffscreenCanvas(640, 480))
  const inputRef = useRef<HTMLInputElement>(null)

  const [ready, setReady] = useState(false)
  const [cameraAccessError, setCameraAccessError] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)

  // Get all current video devices available to the user.
  useEffect(() => {
    const getAllCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setVideoDevices(
        devices.filter(device => {
          return device.kind === 'videoinput'
        })
      )

      // Automatically select first available video device
      if (devices.length > 0) {
        setDeviceId(devices[0].deviceId)
      }
    }

    getAllCameras()
  }, [])

  // General handler for errors which might occur during scanning.
  const handleError = useCallback(
    (error: any) => {
      if (typeof error === 'string') {
        onError(error)
      } else {
        onError(error.toString())
      }
    },
    [onError]
  )

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const result = await qrCodeFromClipboard(runtime)
      onScanSuccess(result)
    } catch (error) {
      handleError(error)
    }
  }, [onScanSuccess, handleError])

  // Read data from an external image file.
  //
  // We first trigger an "file open" dialog by automatically "clicking"
  // an <input> element. The actual conversion and scanning of the file data
  // happens afterwards.
  const handleImportImage = useCallback(async () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }
      const file = event.target.files[0]

      try {
        // Convert file to correct image data and scan it
        const result = await qrCodeFromImage(file)

        if (result) {
          onScanSuccess(result.data)
        } else {
          throw Error(`no data in image`)
        }
      } catch (error: any) {
        handleError(error)
      }

      // Reset the input element again, otherwise we wouldn't be able to trigger
      // another `onChange` again when selecting the same image
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [handleError, onScanSuccess]
  )

  // Show a context menu with different video input options to the user.
  const handleSelectInput = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Allow user to select a different camera when more than one is given
      const cameraItems: ContextMenuItem[] =
        videoDevices.length > 1
          ? videoDevices.map(device => {
              const marker = device.deviceId === deviceId ? ' ✓' : ''
              return {
                label: `${device.label}${marker}`,
                action: () => setDeviceId(device.deviceId),
              }
            })
          : []

      const items: ContextMenuItem[] = [
        ...cameraItems,
        {
          label: tx('load_qr_code_as_image'),
          action: handleImportImage,
          dataTestid: 'load-qr-code-as-image',
        },
        {
          label: tx('paste_from_clipboard'),
          action: handlePasteFromClipboard,
          dataTestid: 'paste-from-clipboard',
        },
      ]

      openContextMenu({
        ...mouseEventToPosition(event),
        items,
      })
    },
    [
      deviceId,
      handleImportImage,
      handlePasteFromClipboard,
      openContextMenu,
      tx,
      videoDevices,
    ]
  )

  // Whenever a camera was (automatically or manually) selected we attempt
  // starting a video stream from it which gets rendered in a video element.
  useEffect(() => {
    let activeStream: MediaStream | undefined
    let unmounted = false

    const video = videoRef.current
    if (!video) {
      return
    }

    const stopStream = async (stream?: MediaStream) => {
      if (!stream) {
        return
      }

      for (const track of stream.getTracks()) {
        track.stop()
      }
    }

    const startStream = async () => {
      const videoConstraints: MediaTrackConstraints = {
        deviceId,
        facingMode: 'user',
      }

      try {
        setReady(false)

        // Stop all streams if some existed before we begin a new one
        stopStream(activeStream)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        })

        if (unmounted) {
          stopStream(stream)
          return
        }

        const videoTracks = stream.getVideoTracks()
        if (videoTracks.length === 0) {
          stopStream(stream)
          throw new Error('no video tracks given')
        }

        video.srcObject = stream
        activeStream = stream

        const settings = videoTracks[0].getSettings()
        if (settings.deviceId) {
          setDeviceId(settings.deviceId)
        }

        if (settings.width && settings.height) {
          canvasRef.current.width = settings.width
          canvasRef.current.height = settings.height
        }

        setReady(true)
      } catch {
        stopStream(activeStream)
        setCameraAccessError(true)
      }
    }

    startStream()

    return () => {
      unmounted = true

      if (video) {
        video.srcObject = null
      }

      stopStream(activeStream)

      setReady(false)
      setCameraAccessError(false)
    }
  }, [deviceId])

  // Frequently scan image data for QR code with "jsqr" library.
  //
  // We achieve this by extracting the image data from the video element using
  // an intermediary canvas context.
  useEffect(() => {
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

    let stopScanning = false
    const scan = async () => {
      context.drawImage(
        video as CanvasImageSource,
        0,
        0,
        canvas.width,
        canvas.height
      )

      if (stopScanning) {
        return
      }

      let scanResult: any
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      if (stopScanning) {
        return
      }

      try {
        worker.postMessage(imageData, { transfer: [imageData.data.buffer] })

        const scanResultP = new Promise(r => {
          worker.addEventListener(
            'message',
            event => {
              r(event.data)
            },
            { once: true }
          )
        })
        scanResult = await scanResultP

        if (stopScanning) {
          return
        }
      } catch (error: any) {
        handleError(error)
      }
      if (scanResult) {
        onScanSuccess(scanResult)
      }
    }

    ;(async () => {
      while (!stopScanning) {
        await scan()
        await new Promise(r => setTimeout(r, SCAN_QR_INTERVAL_MS))
      }
    })()

    return () => {
      stopScanning = true
    }
  }, [handleError, onScanSuccess])

  return (
    <div className={styles.qrReader}>
      <div className={classNames(styles.qrReaderStatus, styles.info)}>
        <Spinner />
      </div>
      <video
        className={classNames(styles.qrReaderVideo, {
          [styles.visible]: ready && !cameraAccessError,
        })}
        autoPlay
        muted
        disablePictureInPicture
        playsInline
        ref={videoRef}
      />
      {cameraAccessError && (
        <div className={classNames(styles.qrReaderStatus, styles.error)}>
          {tx('camera_access_failed')}
        </div>
      )}
      <div className={styles.qrReaderOverlay} />
      {ready && !cameraAccessError && (
        <div className={styles.qrReaderScanLine} />
      )}
      {!cameraAccessError && (
        <div className={styles.qrReaderHint}>{tx('qrscan_hint_desktop')}</div>
      )}
      <button
        className={styles.qrReaderButton}
        onClick={handleSelectInput}
        aria-label={tx('menu_settings')}
        data-testid='qr-reader-settings'
      >
        <Icon icon='settings' size={24} className={styles.qrReaderButtonIcon} />
      </button>
      <input
        className={styles.qrReaderFileInput}
        type='file'
        accept='image/*'
        ref={inputRef}
        onChange={handleFileInputChange}
      />
    </div>
  )
}
