import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ZBarConfigType,
  ZBarScanner,
  ZBarSymbol,
  ZBarSymbolType,
  getDefaultScanner,
  scanImageData,
} from '@undecaf/zbar-wasm'
import classNames from 'classnames'
import { Spinner } from '@blueprintjs/core'

import Icon from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { ScreenContext } from '../../contexts/ScreenContext'
import { runtime } from '../../runtime'

import styles from './styles.module.scss'

import type { ContextMenuItem } from '../ContextMenu'

type Props = {
  onError: (error: string) => void
  onScan: (data: string) => void
}

type ImageDimensions = {
  width: number
  height: number
}

const SCAN_QR_INTERVAL_MS = 50

/**
 * Convert file data to base64 string.
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    try {
      reader.addEventListener(
        'load',
        () => {
          resolve(reader.result as string)
        },
        false
      )

      reader.readAsDataURL(file)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Convert base64-encoded blob string into image data.
 */
async function base64ToImageData(base64: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => {
      try {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = image.width
        canvas.height = image.height

        if (!context) {
          return
        }

        context.drawImage(image, 0, 0)

        const imageData = context.getImageData(0, 0, image.width, image.height)
        resolve(imageData)
      } catch (error) {
        reject(error)
      }
    })

    image.src = base64
  })
}

export default function QrReader({ onError, onScan }: Props) {
  const tx = useTranslationFunction()
  const { openContextMenu } = useContext(ContextMenuContext)
  const { userFeedback } = useContext(ScreenContext)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [scanner, setScanner] = useState<ZBarScanner | undefined>(undefined)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 640,
    height: 480,
  })

  // Create a QR code scanner object from the "zbar" library.
  //
  // We use it to detect QR codes in image data. The library offers many other
  // detection methods as well, we configure it here to only look
  // for "2D QR-Codes".
  useEffect(() => {
    const createScanner = async () => {
      const qrCodeScanner = await getDefaultScanner()

      // First disable all code types
      Object.keys(ZBarSymbolType).forEach(key => {
        qrCodeScanner.setConfig(
          key as unknown as ZBarSymbolType,
          ZBarConfigType.ZBAR_CFG_ENABLE,
          0
        )
      })

      // .. and enable only QrCode scanning
      qrCodeScanner.setConfig(
        ZBarSymbolType.ZBAR_QRCODE,
        ZBarConfigType.ZBAR_CFG_ENABLE,
        1
      )

      setScanner(qrCodeScanner)
    }

    createScanner()
  }, [])

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

  // General handler for scanning results coming from the "zbar" library.
  //
  // Since there can be multiple results we return all them. Additionally
  // we have checks in place to make sure we're not firing any callbacks
  // when this React component has already been unmounted.
  const handleScanResults = useCallback(
    (results: ZBarSymbol[]) => {
      let unmounted = false

      if (unmounted) {
        return
      }

      results.forEach(result => {
        onScan(result.decode())
      })

      return () => {
        unmounted = true
      }
    },
    [onScan]
  )

  // General handler for errors which might occur during scanning.
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

  // Read data from clipboard which potentially can be an image itself.
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      // Try interpreting the clipboard data as an image
      const base64 = await runtime.readClipboardImage()
      if (base64) {
        const imageData = await base64ToImageData(base64)
        const results = await scanImageData(imageData, scanner)
        if (results.length > 0) {
          handleScanResults(results)
          return
        } else {
          throw new Error('no data in clipboard image')
        }
      }

      // .. otherwise return non-image data from clipboard directly
      const data = await runtime.readClipboardText()
      if (!data) {
        throw new Error('no data in clipboard')
      }
      onScan(data)
    } catch (error) {
      userFeedback({
        type: 'error',
        text: `${tx('qrscan_failed')}: ${error}`,
      })
    }
  }, [handleScanResults, onScan, scanner, tx, userFeedback])

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
        const base64 = await fileToBase64(file)
        const imageData = await base64ToImageData(base64)
        const results = await scanImageData(imageData, scanner)

        if (results.length > 0) {
          handleScanResults(results)
        } else {
          userFeedback({
            type: 'error',
            text: `${tx('qrscan_failed')}: no data in image`,
          })
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
    [handleError, handleScanResults, scanner, tx, userFeedback]
  )

  // Show a context menu with different video input options to the user.
  const handleSelectDevice = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const [cursorX, cursorY] = [event.clientX, event.clientY]

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
        },
        {
          label: tx('paste_from_clipboard'),
          action: handlePasteFromClipboard,
        },
      ]

      openContextMenu({
        cursorX,
        cursorY,
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

    const getCamera = async () => {
      const videoConstraints: MediaTrackConstraints = {
        deviceId,
        facingMode: 'user',
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
      } catch {
        setError(true)
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
  }, [deviceId])

  // Frequently scan image data for QR code with "zbar" library.
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
        const results = await scanImageData(imageData, scanner)
        handleScanResults(results)
      } catch (error: any) {
        handleError(error)
      }
    }

    const interval = window.setInterval(scan, SCAN_QR_INTERVAL_MS)
    return () => {
      window.clearInterval(interval)
    }
  }, [handleError, handleScanResults, onScan, scanner])

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
          {tx('camera_access_failed')}
        </div>
      )}
      <div className={styles.qrReaderOverlay} />
      {ready && !error && <div className={styles.qrReaderScanLine} />}
      // @TODO: Translation string needs to be changed to `qrscan_hint_desktop`
      {!error && <div className={styles.qrReaderHint}>{tx('qrscan_hint')}</div>}
      <button className={styles.qrReaderButton} onClick={handleSelectDevice}>
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
