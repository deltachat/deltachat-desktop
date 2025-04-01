import React, { useEffect, useState } from 'react'
import { libheif, loadAndConvertToPngDataUrl } from '../../utils/heif'
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
        const { height, width, dataUrl } = await loadAndConvertToPngDataUrl(src)
        if (updateHeight) {
          setHeight(
            updateHeight({
              dimensionsHeight: height,
              dimensionsWidth: width,
              viewType: 'Image',
            })
          )
        }
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
