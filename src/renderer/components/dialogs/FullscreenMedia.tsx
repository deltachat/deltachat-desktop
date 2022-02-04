import { onDownload } from '../message/messageFunctions'
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Icon, Overlay } from '@blueprintjs/core'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'
import { runtime } from '../../runtime'
import { isImage, isVideo, isAudio } from '../attachment/Attachment'
import { getLogger } from '../../../shared/logger'
import { gitHubIssuesUrl } from '../../../shared/constants'
import { DeltaBackend } from '../../delta-remote'
import { useInitEffect } from '../helpers/hooks'
import { preventDefault } from '../../../shared/util'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useContextMenu } from '../ContextMenu'

const log = getLogger('renderer/fullscreen_media')

export default function FullscreenMedia(props: {
  msg: MessageType
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { onClose } = props

  const [msg, setMsg] = useState(props.msg)
  const resetImageZoom = useRef<(() => void) | null>(
    null
  ) as React.MutableRefObject<(() => void) | null>
  const previousNextMessageId = useRef<[number, number]>([0, 0])
  const [showPreviousNextMessageButtons, setShowPrevNextMsgBtns] = useState({
    previous: false,
    next: false,
  })
  const { file, file_mime } = msg

  const openMenu = useContextMenu([
    {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        runtime.writeClipboardImage(file)
      },
    },
    {
      label: tx('save-as'),
      action: onDownload.bind(null, msg),
    },
  ])

  let elm = null

  if (isImage(file_mime)) {
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
                  <img src={runtime.transformBlobURL(file)} />
                </div>
              </TransformComponent>
            )
          }}
        </TransformWrapper>
      </div>
    )
  } else if (isAudio(file_mime)) {
    elm = <audio src={runtime.transformBlobURL(file)} controls />
  } else if (isVideo(file_mime)) {
    elm = <video src={runtime.transformBlobURL(file)} controls autoPlay />
  } else if (!file_mime) {
    // no file mime
    elm = (
      <div>
        <p>Error: Unknown mime_type for {runtime.transformBlobURL(file)}</p>
        <p>
          Please report this bug on{' '}
          <a href='#' onClick={() => runtime.openLink(gitHubIssuesUrl)}>
            github
          </a>
        </p>
      </div>
    )
    log.warn('Unknown mime type', { file, file_mime })
  } else {
    // can not be displayed by fullscreen media
    elm = (
      <div>
        <p>
          Error: Desktop issue: Unknown media type for{' '}
          {runtime.transformBlobURL(file)} (mime_type: {file_mime})
        </p>
        <p>
          Please report this bug on{' '}
          <a href='#' onClick={() => runtime.openLink(gitHubIssuesUrl)}>
            github
          </a>
        </p>
      </div>
    )
    log.warn('Unknown media type for fullscreen media', { file, file_mime })
  }

  const updatePreviousNextMessageId = useCallback(async () => {
    if (!msg.id) {
      return
    }
    const [previousMessageId, nextMessageId] = await Promise.all([
      DeltaBackend.call('chat.getNextMedia', msg.id, -1),
      DeltaBackend.call('chat.getNextMedia', msg.id, 1),
    ])
    previousNextMessageId.current = [previousMessageId, nextMessageId]
    setShowPrevNextMsgBtns({
      previous: previousMessageId !== 0,
      next: nextMessageId !== 0,
    })
  }, [msg])

  useEffect(() => {
    updatePreviousNextMessageId()
  }, [msg, updatePreviousNextMessageId])
  useInitEffect(() => updatePreviousNextMessageId())

  const { previousImage, nextImage } = useMemo(() => {
    const loadMessage = async (msgID: number) => {
      if (msgID === 0) return
      const message = await DeltaBackend.call('messageList.getMessage', msgID)
      if (message === null) return
      setMsg(message)
      if (resetImageZoom.current !== null) {
        resetImageZoom.current()
      }
    }
    return {
      previousImage: () => loadMessage(previousNextMessageId.current[0]),
      nextImage: () => loadMessage(previousNextMessageId.current[1]),
    }
  }, [previousNextMessageId, setMsg])

  useEffect(() => {
    // use events directly for now
    // this will need adjustment to the keybindings manager once we have proper screen managment
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
      <div className='render-media-wrapper'>
        {elm && (
          <div className='btn-wrapper'>
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
