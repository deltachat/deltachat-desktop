import React from 'react'
import classNames from 'classnames'
import { filesize } from 'filesize'

import { openAttachmentInShell } from '../message/messageFunctions'
import {
  isDisplayableByFullscreenMedia,
  isImage,
  isVideo,
  isAudio,
  getExtension,
  dragAttachmentOut,
  MessageTypeAttachmentSubset,
} from './Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { ConversationType } from '../message/MessageList'
import { getDirection } from '../../utils/getDirection'
import { Type } from '../../backend-com'
import FullscreenMedia, {
  NeighboringMediaMode,
} from '../dialogs/FullscreenMedia'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import AudioPlayer from '../AudioPlayer'

type AttachmentProps = {
  text?: string
  conversationType: ConversationType
  message: Type.Message
  hasQuote: boolean
}

export default function Attachment({
  text,
  conversationType,
  message,
  hasQuote,
}: AttachmentProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  if (!message.file) {
    return null
  }
  const direction = getDirection(message)
  const onClickAttachment = (ev: any) => {
    if (message.viewType === 'Sticker') return
    ev.stopPropagation()
    if (isDisplayableByFullscreenMedia(message.fileMime)) {
      openDialog(FullscreenMedia, {
        msg: message,
        neighboringMedia: NeighboringMediaMode.Chat,
      })
    } else {
      openAttachmentInShell(message)
    }
  }
  const withCaption = Boolean(text)
  // For attachments which aren't full-frame
  const withContentBelow = withCaption
  const withContentAbove =
    message.overrideSenderName != null ||
    hasQuote ||
    (conversationType.hasMultipleParticipants && direction === 'incoming')
  // const dimensions = message.msg.dimensions || {}
  // Calculating height to prevent reflow when image loads
  // const height = Math.max(MINIMUM_IMG_HEIGHT, (dimensions as any).height || 0)
  if (isImage(message.fileMime) || message.viewType === 'Sticker') {
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
      <button
        onClick={onClickAttachment}
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
      </button>
    )
  } else if (isVideo(message.fileMime)) {
    if (!message.file) {
      return (
        <button
          onClick={onClickAttachment}
          style={{ cursor: 'pointer' }}
          className={classNames('message-attachment-broken-media', direction)}
        >
          {tx('attachment_failed_to_load')}
        </button>
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
          className='attachment-content video-content'
          src={runtime.transformBlobURL(message.file)}
          controls={true}
        />
      </div>
    )
  } else if (isAudio(message.fileMime)) {
    return (
      <div
        className={classNames(
          'message-attachment-audio',
          withContentBelow ? 'content-below' : null,
          withContentAbove ? 'content-above' : null
        )}
      >
        <AudioPlayer src={runtime.transformBlobURL(message.file)} />
      </div>
    )
  } else {
    const { fileName, fileBytes, fileMime } = message
    const extension = getExtension(message)
    return (
      <button
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
          title={fileMime || 'null'}
        >
          {extension ? (
            <div className='file-extension'>
              {fileMime === 'application/octet-stream' ? '' : extension}
            </div>
          ) : null}
        </div>
        <div className='text-part'>
          <div className='name'>{fileName}</div>
          <div className='size'>{fileBytes ? filesize(fileBytes) : '?'}</div>
        </div>
      </button>
    )
  }
}

export function DraftAttachment({
  attachment,
}: {
  attachment: MessageTypeAttachmentSubset
}) {
  if (!attachment) {
    return null
  }
  if (isImage(attachment.fileMime)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.file || '')}
        />
      </div>
    )
  } else if (isVideo(attachment.fileMime)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <video
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.file || '')}
          controls
        />
      </div>
    )
  } else if (isAudio(attachment.fileMime)) {
    return <AudioPlayer src={runtime.transformBlobURL(attachment.file || '')} />
  } else {
    const { file, fileName, fileBytes, fileMime } = attachment
    const extension = getExtension(attachment)

    return (
      <div className={classNames('message-attachment-generic')}>
        <div
          className='file-icon'
          draggable='true'
          onDragStart={ev => file && dragAttachmentOut(file, ev)}
          title={fileMime || 'null'}
        >
          {extension ? (
            <div className='file-extension'>
              {fileMime === 'application/octet-stream' ? '' : extension}
            </div>
          ) : null}
        </div>
        <div className='text-part'>
          <div className='name'>{fileName}</div>
          <div className='size'>{fileBytes ? filesize(fileBytes) : '?'}</div>
        </div>
      </div>
    )
  }
}
