import React, { useContext } from 'react'
import { openAttachmentInShell, onDownload } from '../message/messageFunctions'
import { ScreenContext } from '../../contexts'
import {
  isDisplayableByFullscreenMedia,
  isImage,
  isVideo,
  isAudio,
  getExtension,
  dragAttachmentOut,
} from './Attachment'
import Timestamp from '../conversations/Timestamp'
import { MessageType, MessageTypeAttachment } from '../../../shared/shared-types'

export default function MediaAttachment({
  attachment,
  message,
}: {
  attachment: MessageTypeAttachment
  message: MessageType
}) {
  if (!attachment) {
    return null
  }
  const { openDialog } = useContext(ScreenContext)

  const onClickAttachment = (
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    ev.stopPropagation()
    const { msg } = message
    if (isDisplayableByFullscreenMedia(msg.attachment)) {
      openDialog('FullscreenMedia', { msg })
    } else {
      openAttachmentInShell(msg)
    }
  }
  if (isImage(attachment)) {
    return (
      <ImageAttachment
        attachment={attachment}
        onClickAttachment={onClickAttachment}
      />
    )
  } else if (isVideo(attachment)) {
    return (
      <VideoAttachment
        attachment={attachment}
        onClickAttachment={onClickAttachment}
      />
    )
  } else if (isAudio(attachment)) {
    return <AudioAttachment attachment={attachment} message={message} />
  } else {
    return <FileAttachment attachment={attachment} message={message} />
  }
}

type onClickFunction = (
  ev: React.MouseEvent<HTMLDivElement, MouseEvent>
) => void

function ImageAttachment({
  attachment,
  onClickAttachment,
}: {
  attachment: MessageTypeAttachment
  onClickAttachment: onClickFunction
}) {
  if (!attachment.url) {
    return (
      <div className='media-attachment-broken-media'>
        {window.static_translate('imageFailedToLoad')}
      </div>
    )
  }
  return (
    <div
      onClick={onClickAttachment}
      role='button'
      className='media-attachment-media'
    >
      <img className='attachment-content' src={attachment.url} />
    </div>
  )
}

function VideoAttachment({
  attachment,
  onClickAttachment,
}: {
  attachment: MessageTypeAttachment
  onClickAttachment: onClickFunction
}) {
  if (!attachment.url) {
    return (
      <div role='button' className='media-attachment-broken-media'>
        {window.static_translate('videoScreenshotFailedToLoad')}
      </div>
    )
  }
  return (
    <div
      onClick={onClickAttachment}
      role='button'
      className='media-attachment-media'
    >
      <video
        className='attachment-content'
        src={attachment.url}
        controls={false}
      />
      <div className='video-play-btn'>
        <div className='video-play-btn-icon' />
      </div>
    </div>
  )
}

function AudioAttachment({
  attachment,
  message,
}: {
  attachment: MessageTypeAttachment
  message: MessageType
}) {
  return (
    <div className='media-attachment-audio'>
      <div className='heading'>
        <div className='name'>{message?.contact.displayName}</div>
        <Timestamp
          timestamp={message?.msg.timestamp * 1000}
          extended
          module='date'
        />
      </div>
      <audio controls>
        <source src={attachment.url} />
      </audio>
    </div>
  )
}

function FileAttachment({
  attachment,
  message,
}: {
  attachment: MessageTypeAttachment
  message: MessageType
}) {
  const { fileName, fileSize, contentType } = attachment
  const extension = getExtension(attachment)
  return (
    <div
      className='media-attachment-generic'
      role='button'
      onClick={ev => {
        onDownload(message.msg)
      }}
    >
      <div
        className='file-icon'
        draggable='true'
        onClick={ev => {
          ev.stopPropagation()
          openAttachmentInShell(message.msg)
        }}
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
