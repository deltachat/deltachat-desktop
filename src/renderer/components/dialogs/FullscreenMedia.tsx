import { onDownload } from '../message/messageFunctions'
import React from 'react'
import { Icon, Overlay } from '@blueprintjs/core'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'
import { runtime } from '../../runtime'

export default function FullscreenMedia(props: {
  msg: MessageType
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { msg, onClose } = props
  let elm = <div />
  if (!msg || !msg.file) return elm
  const { file, file_mime } = msg

  switch (file_mime.split('/')[0]) {
    case 'image':
      elm = (
        <div className='image-container'>
          <img src={runtime.transformBlobURL(file)} />
        </div>
      )
      break
    case 'audio':
      elm = <audio src={runtime.transformBlobURL(file)} controls />
      break
    case 'video':
      elm = <video src={runtime.transformBlobURL(file)} controls autoPlay />
      break
    default:
      elm = null
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
