import { onDownload } from '../message/messageFunctions'
import React from 'react'
import { Icon, Overlay } from '@blueprintjs/core'
import { DialogProps } from './DialogController'
import { Message } from '../../../shared/shared-types'
import { runtime } from '../../runtime'

export default function FullscreenMedia(props: {
  message: Message
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { message, onClose } = props
  let elm = <div />
  if (!message || !message.attachment) return elm
  const attachment = message.attachment
  const url = attachment.url
  const contentType = attachment.contentType

  switch (contentType.split('/')[0]) {
    case 'image':
      elm = (
        <div className='image-container'>
          <img src={runtime.transformBlobURL(url)} />
        </div>
      )
      break
    case 'audio':
      elm = <audio src={runtime.transformBlobURL(url)} controls />
      break
    case 'video':
      elm = <video src={runtime.transformBlobURL(url)} controls autoPlay />
      break
    default:
      elm = null
  }
  return (
    <Overlay
      isOpen={Boolean(url)}
      className='attachment-overlay'
      onClose={onClose}
    >
      <div className='render-media-wrapper'>
        {elm && (
          <div className='btn-wrapper'>
            <div
              role='button'
              onClick={onDownload.bind(null, message)}
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
