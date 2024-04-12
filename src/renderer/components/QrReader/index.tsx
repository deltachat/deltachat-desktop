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

type FacingMode = 'user' | 'environment'

type Props = {
  onError: (error: string) => void
  onScan: (data: string) => void
}

type ImageDimensions = {
  width: number
  height: number
}

const SCAN_QR_INTERVAL_MS = 50

async function getImageDataFromFile(file: File): Promise<ImageData> {
  const image = new Image()
  const reader = new FileReader()

  return new Promise(resolve => {
    // Extract image data from base64 encoded blob
    image.addEventListener('load', () => {
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
    })

    // Load image from file as base64 encoded data string
    reader.addEventListener(
      'load',
      () => {
        image.src = reader.result as string
      },
      false
    )

    reader.readAsDataURL(file)
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
  const [facingMode, setFacingMode] = useState<FacingMode>('user')
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 640,
    height: 480,
  })

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

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const data = await runtime.readClipboardText()
      if (data) {
        onScan(data)
      } else {
        throw new Error('no data in clipboard')
      }
    } catch (error) {
      userFeedback({
        type: 'error',
        text: `Reading qrcodedata from clipboard failed: ${error}`,
      })
    }
  }, [onScan, userFeedback])

  const handleImportImage = useCallback(async () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      let unmounted = false
      if (!event.target.files || event.target.files.length === 0) {
        return
      }
      const file = event.target.files[0]

      try {
        const imageData = await getImageDataFromFile(file)
        const results = await scanImageData(imageData, scanner)

        if (unmounted) {
          return
        }

        results.forEach(result => {
          onScan(result.decode())
        })
      } catch (error: any) {
        handleError(error)
      }

      return () => {
        unmounted = true
      }
    },
    [handleError, onScan, scanner]
  )

  const handleSelectDevice = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const [cursorX, cursorY] = [event.clientX, event.clientY]
      const items: ContextMenuItem[] = [
        {
          label: tx('load_qr_code_as_image'),
          action: handleImportImage,
        },
        {
          label: tx('paste_from_clipboard'),
          action: handlePasteFromClipboard,
        },
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
    [
      deviceId,
      facingMode,
      handleImportImage,
      handlePasteFromClipboard,
      openContextMenu,
      tx,
      videoDevices,
    ]
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
  }, [deviceId, facingMode])

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
        const results = await scanImageData(imageData, scanner)

        if (unmounted) {
          return
        }

        results.forEach(result => {
          onScan(result.decode())
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
  }, [handleError, onScan, scanner])

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
      <button className={styles.qrReaderButton} onClick={handleSelectDevice}>
        <Icon icon='settings' size={20} className={styles.qrReaderButtonIcon} />
      </button>
      {videoDevices.length > 0 && (
        <button className={styles.qrReaderButton} onClick={handleSelectDevice}>
          <Icon
            icon='settings'
            size={20}
            className={styles.qrReaderButtonIcon}
          />
        </button>
      )}
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
