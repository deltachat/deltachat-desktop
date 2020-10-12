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
import {
  MessageType,
  MessageTypeAttachment,
} from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'

export default function MediaAttachment({ message }: { message: MessageType }) {
  const attachment = message.msg.attachment
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

  switch (message.msg.viewType) {
    case C.DC_MSG_GIF:
    case C.DC_MSG_IMAGE:
      return (
        <ImageAttachment
          attachment={attachment}
          onClickAttachment={onClickAttachment}
        />
      )
    case C.DC_MSG_VIDEO:
      return (
        <VideoAttachment
          attachment={attachment}
          onClickAttachment={onClickAttachment}
        />
      )
    case C.DC_MSG_AUDIO:
    case C.DC_MSG_VOICE:
      return <AudioAttachment attachment={attachment} message={message} />
    case C.DC_MSG_FILE:
    default:
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
  const hasSupportedFormat = isImage(attachment)
  if (!attachment.url || !hasSupportedFormat) {
    return (
      <div className='media-attachment-media broken'>
        <div className='attachment-content'>
          {hasSupportedFormat
            ? window.static_translate('attachment_failed_to_load')
            : window.static_translate(
                'can_not_display_unsuported_file_type',
                attachment.contentType
              )}
        </div>
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
  const hasSupportedFormat = isVideo(attachment)
  if (!attachment.url || !hasSupportedFormat) {
    return (
      <div className='media-attachment-media broken'>
        <div className='attachment-content'>
          {hasSupportedFormat
            ? window.static_translate('attachment_failed_to_load')
            : window.static_translate(
                'can_not_display_unsuported_file_type',
                attachment.contentType
              )}
        </div>
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
  const hasSupportedFormat = isAudio(attachment)
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
      {hasSupportedFormat ? (
        <audio controls>
          <source src={attachment.url} />
        </audio>
      ) : (
        <div>
          {window.static_translate(
            'can_not_display_unsuported_file_type',
            attachment.contentType
          )}
        </div>
      )}
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
