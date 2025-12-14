import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import classNames from 'classnames'

import Icon from '../Icon'
import Spinner from '../Spinner'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { runtime } from '@deltachat-desktop/runtime-interface'

import useAlertDialog from '../../hooks/dialog/useAlertDialog'

import { fileToBase64, base64ToImageData } from './helper'

// @ts-ignore:next-line: We're importing a worker here with the help of the
// "esbuild-plugin-inline-worker" plugin
import QrWorker from './qr.worker'

import styles from './styles.module.scss'

import type { ContextMenuItem } from '../ContextMenu'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/QrCodeReader')

type Props = {
  onError: (error: string) => void
  onScanSuccess: (data: string) => void
}

/**
 * How long to idle between scan operations
 */
const SCAN_QR_INTERVAL_MS = 1000 / 30

export type QrCodeScanRef = {
  handlePasteFromClipboard: () => void
}

/**
 * component to read and process QR codes either
 * by constantly reading image data from a video stream
 * provided by a camera or by processing image data from
 * clipboard or an imported image file
 *
 * used in Qr dialog (QrCode) in second tab
 */
export const QrReader = forwardRef<QrCodeScanRef, Props>(
  ({ onError, onScanSuccess }: Props, ref) => {
    const tx = useTranslationFunction()
    const { openContextMenu } = useContext(ContextMenuContext)
    const openAlertDialog = useAlertDialog()

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<OffscreenCanvas>(new OffscreenCanvas(640, 480))
    const inputRef = useRef<HTMLInputElement>(null)

    const [ready, setReady] = useState(false)
    const [cameraAccessError, setCameraAccessError] = useState(false)
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
    const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
    const [processingFile, setProcessingFile] = useState(false)

    const workerRef = useRef<Worker | null>(null)
    const workerClipBoardRef = useRef<Worker | null>(null)
    // Only create the worker once per component instance.
    if (workerRef.current === null) {
      workerRef.current = new QrWorker() as Worker
    }
    const worker = workerRef.current
    if (workerClipBoardRef.current === null) {
      workerClipBoardRef.current = new QrWorker() as Worker
    }
    const workerClipBoard = workerClipBoardRef.current

    useEffect(() => {
      return () => {
        // terminate worker if component is unmounted,
        // otherwise we might get a delayed error message
        // if scan fails, even after closing the QR dialog
        worker.terminate()
        workerClipBoard.terminate()
      }
    }, [worker, workerClipBoard])

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

    /**
     * pass the processing of imageData to a worker
     * to avoid UI freeze when processing large images
     * or with low peformance cpu
     */
    const processQrCodeWithWorker = useCallback(
      async (
        imageData: ImageData,
        onScanSuccess: (scanResult: string) => void,
        handleError: (error: any) => void
      ) => {
        try {
          workerClipBoard.postMessage(imageData)
          const scanResultP = new Promise(r => {
            workerClipBoard.addEventListener(
              'message',
              event => {
                setProcessingFile(false)
                r(event.data)
              },
              { once: true }
            )
          })
          const scanResult = (await scanResultP) as string
          if (scanResult) {
            onScanSuccess(scanResult)
          } else {
            throw Error(`no data in image`)
          }
        } catch (error: any) {
          setProcessingFile(false)
          handleError(error)
        }
      },
      [workerClipBoard]
    )

    useImperativeHandle(ref, () => ({
      handlePasteFromClipboard() {
        handlePasteFromClipboard()
      },
    }))

    const handlePasteFromClipboard = useCallback(async () => {
      try {
        if (processingFile) {
          openAlertDialog({
            message:
              'Already processing a file. Please wait for the result or cancel it',
          })
          return
        }
        // Try interpreting the clipboard data as an image
        let base64: string | null = null
        setProcessingFile(true)
        try {
          base64 = await runtime.readClipboardImage()
        } catch (error) {
          log.warn('qrCodeFromClipboard: readClipboardImage', error)
        }
        if (base64) {
          const imageData = await base64ToImageData(base64)
          processQrCodeWithWorker(imageData, onScanSuccess, handleError)
        } else {
          setProcessingFile(false)
          // .. otherwise return non-image data from clipboard directly
          const data = await runtime.readClipboardText()
          if (!data) {
            throw new Error('no data in clipboard')
          }
          // trim whitespaces because user might copy them by accident when sending over other messengers
          // see https://github.com/deltachat/deltachat-desktop/issues/4161#issuecomment-2390428338
          onScanSuccess(data.trim())
        }
      } catch (error) {
        handleError(error)
      }
    }, [
      processingFile,
      openAlertDialog,
      processQrCodeWithWorker,
      onScanSuccess,
      handleError,
    ])

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
        if (processingFile) {
          openAlertDialog({
            message:
              'Already processing a file. Please wait for the result or cancel it',
          })
          return
        }
        const file = event.target.files[0]
        setProcessingFile(true)
        try {
          // Convert file to correct image data
          const base64 = await fileToBase64(file)
          const imageData = await base64ToImageData(base64)

          processQrCodeWithWorker(imageData, onScanSuccess, handleError)
        } catch (error: any) {
          setProcessingFile(false)
          handleError(error)
        }

        // Reset the input element again, otherwise we wouldn't be able to trigger
        // another `onChange` again when selecting the same image
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      },
      [
        handleError,
        onScanSuccess,
        openAlertDialog,
        processQrCodeWithWorker,
        processingFile,
      ]
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

          try {
            const permission_status = await runtime.checkMediaAccess('camera')
            if (permission_status === 'not-determined') {
              if (!(await runtime.askForMediaAccess('camera'))) {
                log.error(
                  'runtime reported that permission request was denied by user'
                )
                setCameraAccessError(true)
                return
              }
            } else if (
              permission_status !== 'granted' &&
              permission_status !== 'unknown'
            ) {
              log.error('runtime reported that permission is not granted:', {
                permission_status,
              })
              setCameraAccessError(true)
              return
            }
          } catch (err: any) {
            if (err.message !== 'UnsupportedPlatform') {
              log.warn('failed to check for runtime media permission:', err)
            }
          }

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
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        )

        if (stopScanning) {
          return
        }

        try {
          worker.postMessage(imageData, {
            transfer: [imageData.data.buffer],
          })

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
    }, [handleError, onScanSuccess, worker])

    return (
      <div className={styles.qrReader}>
        <div className={classNames(styles.qrReaderStatus, styles.info)}>
          <Spinner />
        </div>
        <video
          className={classNames(styles.qrReaderVideo, {
            [styles.visible]: ready && !cameraAccessError && !processingFile,
          })}
          autoPlay
          muted
          disablePictureInPicture
          playsInline
          ref={videoRef}
        />
        {cameraAccessError && !processingFile && (
          <div className={classNames(styles.qrReaderStatus, styles.error)}>
            {tx('camera_access_failed')}
          </div>
        )}
        {!processingFile && <div className={styles.qrReaderOverlay} />}
        {ready && !cameraAccessError && !processingFile && (
          <div className={styles.qrReaderScanLine} />
        )}
        {!cameraAccessError && !processingFile && (
          <div className={styles.qrReaderHint}>{tx('qrscan_hint_desktop')}</div>
        )}
        {!processingFile && (
          <button
            type='button'
            className={styles.qrReaderButton}
            onClick={handleSelectInput}
            aria-label={tx('menu_settings')}
            data-testid='qr-reader-settings'
          >
            <Icon
              icon='settings'
              size={24}
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
)
