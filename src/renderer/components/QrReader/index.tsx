import React, { useEffect, useRef, useState } from 'react'
import { read_qrcodes_from_image_data as readQrCodeFromImageData } from 'quircs-wasm'

import styles from './styles.module.scss'

import type { QRCode } from 'quircs-wasm'

type Props = {
  onError: (error: string) => void
  onScan: (data: string) => void
}

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
    const scan = () => {
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

      const data = context.getImageData(0, 0, canvas.width, canvas.height)
      const results: QRCode[] = readQrCodeFromImageData(data, true)

      results.forEach(({ data }) => {
        if ('content' in data) {
          const result = String.fromCharCode.apply(null, data.content.payload)
          props.onScan(result)
        } else if ('error' in data) {
          props.onError(data.error)
        }
      })
    }

    const interval = window.setInterval(scan, 200)

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
