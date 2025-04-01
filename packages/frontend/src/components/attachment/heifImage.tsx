import React, { useEffect, useState } from 'react'
import { libheif } from '../../utils/heif'
import { T } from '@deltachat/jsonrpc-client'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('renderer/heifImage')

export function HeifImage({
  className,
  height: originalHeight,
  src,
  updateHeight,
}: {
  className: string
  height?: number
  src: string
  updateHeight?: (
    newHeight: Pick<
      T.Message,
      'dimensionsHeight' | 'dimensionsWidth' | 'viewType'
    >
  ) => number
}) {
  const [imgSrc, setImgSrc] = useState<null | string>(null)
  const [height, setHeight] = useState<number | undefined>(originalHeight)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const buffer = await (await fetch(src)).arrayBuffer()
        const decoder = new libheif!.HeifDecoder()
        // console.log({ libheif, decoder })
        const data = decoder.decode(buffer)
        const image = data[0]
        const width = image.get_width()
        const height = image.get_height()
        if (updateHeight) {
          setHeight(updateHeight(height))
        }
        // console.log({ image, width, height })
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')!
        const imageData = context.createImageData(width, height)
        await new Promise<void>((resolve, reject) => {
          image.display(imageData, (displayData: unknown) => {
            if (!displayData) {
              setError('HEIF processing error')
              return reject(new Error('HEIF processing error'))
            }

            resolve()
          })
        })
        context.putImageData(imageData, 0, 0)
        const dataUrl = canvas.toDataURL()
        // console.log({ dataUrl })
        setImgSrc(dataUrl)
      } catch (e: unknown) {
        log.error('failed to convert/load heif image', e)
        setError(`failed to convert/load heif image: ${(e as any)?.message}`)
      }
    })()
  }, [src, updateHeight])

  if (!imgSrc) {
    return (
      <div style={{ height, minHeight: '100px' }}>
        HEIF IMAGE LOADING{' '}
        {error && (
          <>
            <br />
            {error}
          </>
        )}
      </div>
    )
  }

  return <img className={className} src={imgSrc} style={{ height }} />
}
