import { onDownload } from '../message/messageFunctions'
import React, {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useState,
} from 'react'
import { Icon, Overlay } from '@blueprintjs/core'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'
import { runtime } from '../../runtime'
import { isImage, isVideo, isAudio } from '../attachment/Attachment'
import { getLogger } from '../../../shared/logger'
import { gitHubIssuesUrl } from '../../../shared/constants'
import { DeltaBackend } from '../../delta-remote'
import { useInitEffect } from '../helpers/useInitEffect'

const log = getLogger('renderer/fullscreen_media')

export default function FullscreenMedia(props: {
  msg: MessageType
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { onClose } = props

  const [msg, setMsg] = useState(props.msg)
  const [previousNextMessageId, setPreviousNextMessageId] = useState<
    [number, number]
  >([0, 0])
  const { file, file_mime } = msg

  let elm = null

  if (isImage(file_mime)) {
    elm = (
      <div className='image-container'>
        <img src={runtime.transformBlobURL(file)} />
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

  const updatePreviousNextMessageId = async () => {
    const previousMessageId = await DeltaBackend.call(
      'chat.getNextMedia',
      msg.id,
      -1
    )
    const nextMessageId = await DeltaBackend.call(
      'chat.getNextMedia',
      msg.id,
      1
    )
    setPreviousNextMessageId([previousMessageId, nextMessageId])
  }

  useEffect(() => {
    updatePreviousNextMessageId()
  }, [msg])
  useInitEffect(() => updatePreviousNextMessageId())

  const previousImage = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const message = await DeltaBackend.call(
      'messageList.getMessage',
      previousNextMessageId[0]
    )
    if (message === null) return
    setMsg(message)
  }
  const nextImage = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const message = await DeltaBackend.call(
      'messageList.getMessage',
      previousNextMessageId[1]
    )
    if (message === null) return
    setMsg(message)
  }

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
        {previousNextMessageId[0] !== 0 && (
          <div className='media-previous-button'>
            <Icon onClick={previousImage} icon='chevron-left' iconSize={60} />
          </div>
        )}

        {previousNextMessageId[1] !== 0 && (
          <div className='media-next-button'>
            <Icon onClick={nextImage} icon='chevron-right' iconSize={60} />
          </div>
        )}
        <div className='attachment-view'>{elm}</div>
      </div>
    </Overlay>
  )
}
