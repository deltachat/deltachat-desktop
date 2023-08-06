import { onDownload } from '../message/messageFunctions'
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Icon, Overlay } from '@blueprintjs/core'
import { DialogProps } from './DialogController'
import { runtime } from '../../runtime'
import { isImage, isVideo, isAudio } from '../attachment/Attachment'
import { getLogger } from '../../../shared/logger'
import { gitHubIssuesUrl } from '../../../shared/constants'
import { useInitEffect } from '../helpers/hooks'
import { preventDefault } from '../../../shared/util'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useContextMenu } from '../ContextMenu'
import { jumpToMessage } from '../helpers/ChatMethods'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { QRCode, read_qrcodes_from_image_data } from 'quircs-wasm'
import processOpenQrUrl from '../helpers/OpenQrUrl'

const log = getLogger('renderer/fullscreen_media')

export default function FullscreenMedia(props: {
  msg: Type.Message
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { onClose } = props

  const [msg, setMsg] = useState(props.msg)
  const resetImageZoom = useRef<(() => void) | null>(
    null
  ) as React.MutableRefObject<(() => void) | null>
  const previousNextMessageId = useRef<[number | null, number | null]>([
    null,
    null,
  ])
  const [showPreviousNextMessageButtons, setShowPrevNextMsgBtns] = useState({
    previous: false,
    next: false,
  })
  const { file, fileMime } = msg

  if (!file) {
    log.error('file attribute not set in message', msg)
    throw new Error('file attribute not set')
  }

  const openMenu = useContextMenu([
    {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        runtime.writeClipboardImage(file)
      },
    },
    {
      label: tx('save_as'),
      action: onDownload.bind(null, msg),
    },
    {
      label: tx('show_in_chat'),
      action: () => {
        jumpToMessage(msg.id)
        onClose()
      },
    },
  ])

  let elm = null

  const qrQverlayCanvas = useRef<HTMLCanvasElement>(null)
  const [hasQrCodes, setHasQrCodes] = useState(false)
  const [hideQRCodeHighlight, setHideQRCodeHighlight] = useState(false)
  const [qrcodes, setQrCodes] = useState<QRCode[]>([])
  const [imgScalingRatio, setImgScalingRatio] = useState<number>(1)
  const [imgDimensions, setImgDimensions] = useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  const detectQRCodes: React.ReactEventHandler<HTMLImageElement> = ev => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('failed to get reading context')
    }
    const img = ev.target as HTMLImageElement
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    // because keeping the aspect ratio happens in one css property it is not reflected in the image.height and .width for some reson
    // so we have to calc the real dimensions ourselves
    const realScalingRatio =
      img.width / img.height < 1
        ? img.width / img.naturalWidth
        : img.height / img.naturalHeight
    setImgScalingRatio(realScalingRatio)
    setImgDimensions({
      width: img.naturalWidth * realScalingRatio,
      height: img.naturalHeight * realScalingRatio,
    })
    context.drawImage(img, 0, 0)
    const result = read_qrcodes_from_image_data(
      context.getImageData(0, 0, img.naturalWidth, img.naturalHeight),
      true
    )
    console.log(result)

    if (result.length >= 1) {
      setHasQrCodes(true)
      setQrCodes(result)
      if (qrQverlayCanvas.current) {
        const context = qrQverlayCanvas.current.getContext('2d')
        if (!context) {
          throw new Error('failed to get drawing context')
        }
        context.clearRect(0, 0, canvas.width, canvas.height)
        for (let qr of result) {
          // TODO add highlights this as html elements (easier hover effects and accessibility)
          context.lineWidth = 10
          if (Object.keys(qr.data).includes('content')) {
            context.strokeStyle = 'green'
          } else {
            context.strokeStyle = 'red'
          }

          context.fillStyle = 'grey'
          context.beginPath()
          context.moveTo(qr.corners[0].x, qr.corners[0].y)
          context.lineTo(qr.corners[1].x, qr.corners[1].y)
          context.lineTo(qr.corners[2].x, qr.corners[2].y)
          context.lineTo(qr.corners[3].x, qr.corners[3].y)
          context.fill()

          context.beginPath()
          context.moveTo(qr.corners[0].x, qr.corners[0].y)
          context.lineTo(qr.corners[1].x, qr.corners[1].y)
          context.lineTo(qr.corners[2].x, qr.corners[2].y)
          context.lineTo(qr.corners[3].x, qr.corners[3].y)
          context.lineTo(qr.corners[0].x, qr.corners[0].y)
          context.lineTo(qr.corners[1].x, qr.corners[1].y)
          context.stroke()

          context.font = '40px Arial'
          context.fillStyle = 'white'
          context.font = '20px Arial'
          context.fillStyle = 'white'
          const x = qr.corners[0].x + 5
          const y = qr.corners[0].y + 45
          if (qr.data['error']) {
            const error = qr.data['error']
            console.log(error)
            context.fillStyle = 'orange'
            context.fillText(error, x, y + 20)
          } else {
            const data = qr.data['content']
            context.fillText(`version: ${data.version}`, x, y + 20)
            context.fillText(`mask: ${data.mask}`, x, y + 20 * 2)
            context.fillText(`ecc_level: ${data.ecc_level}`, x, y + 20 * 3)
            context.fillText(`data_type: ${data.data_type}`, x, y + 20 * 4)
            // let payload = data.payload;
            // codes.push(`${i}: ${String.fromCharCode.apply(null, payload)}`);
          }
        }
      }
    }
  }

  if (isImage(fileMime)) {
    elm = (
      <div className='image-container'>
        <TransformWrapper initialScale={1}>
          {utils => {
            resetImageZoom.current = () => {
              utils.resetTransform()
            }
            return (
              <TransformComponent>
                <div
                  className='image-context-menu-container'
                  onContextMenu={openMenu}
                >
                  <div className='qr-code-highlight-container'>
                    <div
                      className='qr-code-highlight-img-area'
                      style={{
                        width: imgDimensions.width,
                        height: imgDimensions.height,
                      }}
                    >
                      {!hideQRCodeHighlight &&
                        qrcodes.map(code => (
                          <QrCodeHighlight
                            code={code}
                            scalingRatio={imgScalingRatio}
                            key={JSON.stringify(code)}
                          />
                        ))}
                    </div>
                  </div>
                  <img
                    src={runtime.transformBlobURL(file)}
                    onLoad={detectQRCodes}
                    onContextMenu={openMenu}
                  />
                </div>
              </TransformComponent>
            )
          }}
        </TransformWrapper>
      </div>
    )
  } else if (isAudio(fileMime)) {
    elm = <audio src={runtime.transformBlobURL(file)} controls />
  } else if (isVideo(fileMime)) {
    elm = <video src={runtime.transformBlobURL(file)} controls autoPlay />
  } else if (!fileMime) {
    // no file mime
    elm = (
      <div>
        <p>Error: Unknown mimeType for {runtime.transformBlobURL(file)}</p>
        <p>mimeType is "{fileMime}"</p>
        <p>
          Please report this bug on{' '}
          <a href='#' onClick={() => runtime.openLink(gitHubIssuesUrl)}>
            github
          </a>
        </p>
      </div>
    )
    log.warn('Unknown mime type', { file, fileMime })
  } else {
    // can not be displayed by fullscreen media
    elm = (
      <div>
        <p>
          Error: Desktop issue: Unknown media type for{' '}
          {runtime.transformBlobURL(file)} (mimetype: {fileMime})
        </p>
        <p>
          Please report this bug on{' '}
          <a href='#' onClick={() => runtime.openLink(gitHubIssuesUrl)}>
            github
          </a>
        </p>
      </div>
    )
    log.warn('Unknown media type for fullscreen media', {
      file,
      fileMime,
    })
  }
  const updatePreviousNextMessageId = useCallback(async () => {
    if (!msg.id) {
      return
    }
    previousNextMessageId.current = await getNeighboringMedia(
      msg.id,
      msg.viewType
    )
    setShowPrevNextMsgBtns({
      previous: previousNextMessageId.current[0] !== null,
      next: previousNextMessageId.current[1] !== null,
    })
  }, [msg])

  useEffect(() => {
    updatePreviousNextMessageId()
  }, [msg, updatePreviousNextMessageId])
  useInitEffect(() => updatePreviousNextMessageId())

  const { previousImage, nextImage } = useMemo(() => {
    const loadMessage = async (msgID: number) => {
      if (msgID === 0) return
      const message = await BackendRemote.rpc.getMessage(
        selectedAccountId(),
        msgID
      )
      if (message === null) return
      setMsg(message)
      if (resetImageZoom.current !== null) {
        resetImageZoom.current()
      }
      setHasQrCodes(false)
      setQrCodes([])
    }
    return {
      previousImage: () => loadMessage(previousNextMessageId.current[0] || 0),
      nextImage: () => loadMessage(previousNextMessageId.current[1] || 0),
    }
  }, [previousNextMessageId, setMsg])

  useEffect(() => {
    // use events directly for now
    // this will need adjustment to the keybindings manager once we have proper screen management
    // where we can know exactly which screen / menu / dialog is focused
    // and only send the context dependend keys to there
    const listener = (ev: KeyboardEvent) => {
      if (ev.repeat) {
        return
      }
      ev.preventDefault()
      ev.stopPropagation()
      if (ev.key == 'ArrowLeft') {
        previousImage()
      } else if (ev.key == 'ArrowRight') {
        nextImage()
      }
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [previousImage, nextImage])

  if (!msg || !msg.file) return elm

  return (
    <Overlay
      isOpen={Boolean(file)}
      className='attachment-overlay'
      onClose={onClose}
    >
      <div className='render-media-wrapper' tabIndex={0}>
        {elm && (
          <div className='btn-wrapper'>
            {hasQrCodes && (
              <div
                role='button'
                onClick={() => setHideQRCodeHighlight(state => !state)}
                className={
                  hideQRCodeHighlight
                    ? 'qrhighlight-off-btn'
                    : 'qrhighlight-on-btn'
                }
                aria-label={tx('toogle_qr_code_highlight')}
              />
            )}
            <div
              role='button'
              onClick={onDownload.bind(null, msg)}
              className='download-btn'
              aria-label={tx('save')}
            />
            <Icon
              onClick={onClose}
              icon='cross'
              iconSize={32}
              color={'grey'}
              aria-label={tx('close')}
            />
          </div>
        )}
        {showPreviousNextMessageButtons.previous && (
          <div className='media-previous-button'>
            <Icon
              onClick={preventDefault(previousImage)}
              icon='chevron-left'
              iconSize={60}
            />
          </div>
        )}
        {showPreviousNextMessageButtons.next && (
          <div className='media-next-button'>
            <Icon
              onClick={preventDefault(nextImage)}
              icon='chevron-right'
              iconSize={60}
            />
          </div>
        )}
        <div className='attachment-view'>{elm}</div>
      </div>
    </Overlay>
  )
}

async function getNeighboringMedia(
  messageId: number,
  viewType: Type.Viewtype
): Promise<[previousMessageId: number | null, nextMessageId: number | null]> {
  const accountId = selectedAccountId()

  // workaround to get gifs and images into the same media list
  let additionalViewType: Type.Viewtype | null = null
  if (viewType === 'Image') {
    additionalViewType = 'Gif'
  } else if (viewType === 'Gif') {
    additionalViewType = 'Image'
  }

  return await BackendRemote.rpc.getNeighboringChatMedia(
    accountId,
    messageId,
    viewType,
    additionalViewType,
    null
  )
}

function QrCodeHighlight({
  code,
  scalingRatio,
}: {
  code: QRCode
  scalingRatio: number
}) {
  const tx = window.static_translate
  // idea square in dimensions or qr code,
  // but later change perspective correctly so it looks like argumented reality ;)

  const isError: boolean = Boolean(code.data['error'])

  const borderColor = isError ? 'grey' : 'gold'

  const x = code.corners[0].x * scalingRatio
  const y = code.corners[0].y * scalingRatio

  const height = Math.abs(code.corners[3].y - code.corners[0].y) * scalingRatio
  const width = Math.abs(code.corners[2].x - code.corners[0].x) * scalingRatio

  const onClick = () => {
    if (code.data['content']) {
      processOpenQrUrl(
        String.fromCharCode.apply(null, code.data['content']?.payload)
      )
    }
  }

  const menu = useContextMenu([
    {
      label: tx('menu_copy_to_clipboard'),
      action: () =>
        runtime.writeClipboardText(
          String.fromCharCode.apply(null, code.data['content']?.payload)
        ),
    },
  ])

  return (
    <div
      className='qrcode-highlight'
      style={{
        borderColor,
        translate: `${x}px ${y}px`,
        height: `${height}px`,
        width: `${width}px`,
        cursor: isError ? 'default' : 'pointer',
      }}
      title={
        code.data['error'] ||
        String.fromCharCode.apply(null, code.data['content']?.payload)
      }
      onClick={onClick}
      onContextMenu={code.data['content'] && menu}
    >
      {code.data['error']}
      <br />
      {JSON.stringify(code.corners)}
      QRCODE {String.fromCharCode.apply(null, code.data['content']?.payload)}
    </div>
  )
}
