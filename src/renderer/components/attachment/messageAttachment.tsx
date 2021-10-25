import React, { useContext } from 'react'
import classNames from 'classnames'
import { openAttachmentInShell } from '../message/messageFunctions'
import { C } from 'deltachat-node/dist/constants'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  isDisplayableByFullscreenMedia,
  isImage,
  isVideo,
  isAudio,
  getExtension,
  dragAttachmentOut,
} from './Attachment'
import {
  JsonMessage,
  JsonMessageAttachmentSubset,
} from '../../../shared/shared-types'
import { runtime } from '../../runtime'
import { ConversationType } from '../message/MessageList'
import { getDirection } from '../../../shared/util'

import filesizeConverter from 'filesize'

// const MINIMUM_IMG_HEIGHT = 150
// const MAXIMUM_IMG_HEIGHT = 300

type AttachmentProps = {
  text?: string
  conversationType: ConversationType
  message: JsonMessage
  hasQuote: boolean
}

export default function Attachment({
  text,
  conversationType,
  message,
  hasQuote,
}: AttachmentProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  if (!message.file) {
    return null
  }
  const direction = getDirection(message)
  const onClickAttachment = (ev: any) => {
    if (message.viewType === C.DC_MSG_STICKER) return
    ev.stopPropagation()
    if (isDisplayableByFullscreenMedia(message.file_mime)) {
      openDialog('FullscreenMedia', { msg: message })
    } else {
      openAttachmentInShell(message)
    }
  }
  const withCaption = Boolean(text)
  // For attachments which aren't full-frame
  const withContentBelow = withCaption
  const withContentAbove =
    hasQuote ||
    (conversationType.hasMultipleParticipants && direction === 'incoming')
  // const dimensions = message.msg.dimensions || {}
  // Calculating height to prevent reflow when image loads
  // const height = Math.max(MINIMUM_IMG_HEIGHT, (dimensions as any).height || 0)
  if (isImage(message.file_mime)) {
    if (!message.file) {
      return (
        <div
          className={classNames('message-attachment-broken-media', direction)}
        >
          {tx('attachment_failed_to_load')}
        </div>
      )
    }
    return (
      <div
        onClick={onClickAttachment}
        role='button'
        className={classNames(
          'message-attachment-media',
          withCaption ? 'content-below' : null,
          withContentAbove ? 'content-above' : null
        )}
      >
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(message.file)}
        />
      </div>
    )
  } else if (isVideo(message.file_mime)) {
    if (!message.file) {
      return (
        <div
          role='button'
          onClick={onClickAttachment}
          style={{ cursor: 'pointer' }}
          className={classNames('message-attachment-broken-media', direction)}
        >
          {tx('attachment_failed_to_load')}
        </div>
      )
    }
    // the native fullscreen option is better right now so we don't need to open our own one
    return (
      <div
        className={classNames(
          'message-attachment-media',
          withCaption ? 'content-below' : null,
          withContentAbove ? 'content-above' : null
        )}
      >
        <video
          className='attachment-content'
          src={runtime.transformBlobURL(message.file)}
          controls={true}
        />
      </div>
    )
  } else if (isAudio(message.file_mime)) {
    return (
      <audio
        controls
        className={classNames(
          'message-attachment-audio',
          withContentBelow ? 'content-below' : null,
          withContentAbove ? 'content-above' : null
        )}
      >
        <source src={runtime.transformBlobURL(message.file)} />
      </audio>
    )
  } else {
    const { file_name, file_bytes, file_mime } = message
    const extension = getExtension(message)
    return (
      <div
        className={classNames(
          'message-attachment-generic',
          withContentBelow ? 'content-below' : null,
          withContentAbove ? 'content-above' : null
        )}
        onClick={onClickAttachment}
      >
        <div
          className='file-icon'
          draggable='true'
          onDragStart={dragAttachmentOut.bind(null, message.file)}
          title={file_mime || 'null'}
        >
          {extension ? (
            <div className='file-extension'>
              {file_mime === 'application/octet-stream' ? '' : extension}
            </div>
          ) : null}
        </div>
        <div className='text-part'>
          <div className='name'>{file_name}</div>
          <div className='size'>
            {file_bytes ? filesizeConverter(file_bytes) : '?'}
          </div>
        </div>
      </div>
    )
  }
}

export function DraftAttachment({
  attachment,
}: {
  attachment: JsonMessageAttachmentSubset
}) {
  if (!attachment) {
    return null
  }
  if (isImage(attachment.file_mime)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.file)}
        />
      </div>
    )
  } else if (isVideo(attachment.file_mime)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <video
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.file)}
          controls
        />
      </div>
    )
  } else if (isAudio(attachment.file_mime)) {
    return (
      <audio controls className={classNames('message-attachment-audio')}>
        <source src={runtime.transformBlobURL(attachment.file)} />
      </audio>
    )
  } else {
    const { file_name, file_bytes, file_mime } = attachment
    const extension = getExtension(attachment)
    return (
      <div className={classNames('message-attachment-generic')}>
        <div
          className='file-icon'
          draggable='true'
          onDragStart={ev => file_name && dragAttachmentOut(file_name, ev)}
          title={file_mime || 'null'}
        >
          {extension ? (
            <div className='file-extension'>
              {file_mime === 'application/octet-stream' ? '' : extension}
            </div>
          ) : null}
        </div>
        <div className='text-part'>
          <div className='name'>{file_name}</div>
          <div className='size'>
            {file_bytes ? filesizeConverter(file_bytes) : '?'}
          </div>
        </div>
      </div>
    )
  }
}
