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
  MessageType,
  MessageTypeAttachment,
} from '../../../shared/shared-types'
import { runtime } from '../../runtime'
import { ConversationType } from '../message/MessageList'

// const MINIMUM_IMG_HEIGHT = 150
// const MAXIMUM_IMG_HEIGHT = 300

type AttachmentProps = {
  attachment: MessageTypeAttachment
  text?: string
  conversationType: ConversationType
  direction: MessageType['msg']['direction']
  message: MessageType
  hasQuote: boolean
}

export default function Attachment({
  attachment,
  text,
  conversationType,
  direction,
  message,
  hasQuote,
}: AttachmentProps) {
  const tx = useTranslationFunction()
  if (!attachment) {
    return null
  }
  const { openDialog } = useContext(ScreenContext)
  const msg = message.msg
  const onClickAttachment = (ev: any) => {
    if (msg.viewType === C.DC_MSG_STICKER) return
    ev.stopPropagation()
    if (isDisplayableByFullscreenMedia(msg.attachment)) {
      openDialog('FullscreenMedia', { msg })
    } else {
      openAttachmentInShell(msg)
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
  if (isImage(attachment)) {
    if (!attachment.url) {
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
          src={runtime.transformBlobURL(attachment.url)}
        />
      </div>
    )
  } else if (isVideo(attachment)) {
    if (!attachment.url) {
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
          src={runtime.transformBlobURL(attachment.url)}
          controls={true}
        />
      </div>
    )
  } else if (isAudio(attachment)) {
    return (
      <audio
        controls
        className={classNames(
          'message-attachment-audio',
          withContentBelow ? 'content-below' : null,
          withContentAbove ? 'content-above' : null
        )}
      >
        <source src={runtime.transformBlobURL(attachment.url)} />
      </audio>
    )
  } else {
    const { fileName, fileSize, contentType } = attachment
    const extension = getExtension(attachment)
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
          onDragStart={dragAttachmentOut.bind(null, attachment)}
          title={contentType}
        >
          {extension ? (
            <div className='file-extension'>
              {contentType === 'application/octet-stream' ? '' : extension}
            </div>
          ) : null}
        </div>
        <div className='text-part'>
          <div className='name'>{fileName}</div>
          <div className='size'>{fileSize}</div>
        </div>
      </div>
    )
  }
}

export function DraftAttachment({
  attachment,
}: {
  attachment: MessageTypeAttachment
}) {
  if (!attachment) {
    return null
  }
  if (isImage(attachment)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.url)}
        />
      </div>
    )
  } else if (isVideo(attachment)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <video
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.url)}
          controls
        />
      </div>
    )
  } else if (isAudio(attachment)) {
    return (
      <audio controls className={classNames('message-attachment-audio')}>
        <source src={runtime.transformBlobURL(attachment.url)} />
      </audio>
    )
  } else {
    const { fileName, fileSize, contentType } = attachment
    const extension = getExtension(attachment)
    return (
      <div className={classNames('message-attachment-generic')}>
        <div
          className='file-icon'
          draggable='true'
          onDragStart={dragAttachmentOut.bind(null, attachment)}
          title={contentType}
        >
          {extension ? (
            <div className='file-extension'>
              {contentType === 'application/octet-stream' ? '' : extension}
            </div>
          ) : null}
        </div>
        <div className='text-part'>
          <div className='name'>{fileName}</div>
          <div className='size'>{fileSize}</div>
        </div>
      </div>
    )
  }
}
