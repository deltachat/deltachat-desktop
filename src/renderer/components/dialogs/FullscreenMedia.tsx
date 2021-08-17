import { onDownload } from '../message/messageFunctions'
import React from 'react'
import { Icon, Overlay } from '@blueprintjs/core'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'
import { runtime } from '../../runtime'
import { isImage, isVideo, isAudio } from '../attachment/Attachment'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/fullscreen_media')

export default function FullscreenMedia(props: {
  msg: MessageType
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { msg, onClose } = props
  let elm = <div />
  if (!msg || !msg.file) return elm
  const { file, file_mime } = msg

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
        <p>Please report this bug on github</p>
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
        <p>Please report this bug on github</p>
      </div>
    )
    log.warn('Unknown media type for fullscreen media', { file, file_mime })
  }

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
        <div className='attachment-view'>{elm}</div>
      </div>
    </Overlay>
  )
}
