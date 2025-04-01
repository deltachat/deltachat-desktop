import React, { useLayoutEffect, useState } from 'react'
import { loadAndConvertToPngDataUrl } from '../../utils/heif'
import type { T } from '@deltachat/jsonrpc-client'
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

  useLayoutEffect(() => {
    ;(async () => {
      try {
        const { height, width, objectUrl } =
          await loadAndConvertToPngDataUrl(src)
        if (updateHeight) {
          setHeight(
            updateHeight({
              dimensionsHeight: height,
              dimensionsWidth: width,
              viewType: 'Image',
            })
          )
        }
        setImgSrc(objectUrl)
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
