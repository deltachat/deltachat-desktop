import React, { useEffect, useRef, useState } from 'react'
import { readBarcodesFromImageData, setZXingModuleOverrides } from 'zxing-wasm'

import styles from './styles.module.scss'

type Props = {
  onError: (error: string) => void
  onScan: (data: string) => void
}

const SCAN_QR_INTERVAL_MS = 50

setZXingModuleOverrides({
  locateFile: (path, prefix) => {
    if (path.endsWith('.wasm')) {
      return `./${path}`
    }
    return prefix + path
  },
})

export default function QrReader(props: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600,
  })

  useEffect(() => {
    let activeStream: MediaStream | undefined

    const video = videoRef.current
    if (!video) {
      return
    }

    const videoConstraints = {
      facingMode: 'user',
    }

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints })
      .then(stream => {
        video.srcObject = stream
        activeStream = stream

        const { height, width } = stream.getVideoTracks()[0].getSettings()
        if (!width || !height) {
          return
        }

        setDimensions({
          width,
          height,
        })
      })

    return () => {
      if (!video) {
        return
      }

      video.srcObject = null

      if (!activeStream) {
        return
      }

      for (const track of activeStream.getTracks()) {
        track.stop()
      }
    }
  }, [])

  useEffect(() => {
    const scan = async () => {
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
        results.forEach(result => {
          props.onScan(result.text)
        })
      } catch (error: any) {
        if (typeof error === 'string') {
          props.onError(error)
        } else {
          props.onError(error.toString())
        }
      }
    }

    const interval = window.setInterval(scan, SCAN_QR_INTERVAL_MS)
    return () => {
      window.clearInterval(interval)
    }
  }, [props])

  return (
    <div className={styles.qrReader}>
      <canvas
        className={styles.qrReaderCanvas}
        width={dimensions.width}
        height={dimensions.height}
        ref={canvasRef}
      />
      <video
        className={styles.qrReaderVideo}
        autoPlay
        muted
        disablePictureInPicture
        playsInline
        ref={videoRef}
      />
    </div>
  )
}
