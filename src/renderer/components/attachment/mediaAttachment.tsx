import React, { useContext } from 'react'
import { openAttachmentInShell, onDownload } from '../message/messageFunctions'
import { ScreenContext } from '../../contexts'
import {
  isImage,
  isVideo,
  isAudio,
  getExtension,
  dragAttachmentOut,
} from './Attachment'
import Timestamp from '../conversations/Timestamp'
import { MessageType } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'

export default function MediaAttachment({ message }: { message: MessageType }) {
  if (!message.msg.attachment) {
    return null
  }
  switch (message.msg.viewType) {
    case C.DC_MSG_GIF:
    case C.DC_MSG_IMAGE:
      return <ImageAttachment message={message} />
    case C.DC_MSG_VIDEO:
      return <VideoAttachment message={message} />
    case C.DC_MSG_AUDIO:
    case C.DC_MSG_VOICE:
      return <AudioAttachment message={message} />
    case C.DC_MSG_FILE:
    default:
      return <FileAttachment message={message} />
  }
}

function ImageAttachment({ message }: { message: MessageType }) {
  const { openDialog } = useContext(ScreenContext)
  const { attachment } = message.msg
  const hasSupportedFormat = isImage(attachment)
  if (!attachment.url || !hasSupportedFormat) {
    return (
      <div
        className='media-attachment-media broken'
        onClick={() => openAttachmentInShell(message.msg)}
      >
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
      onClick={() => openDialog('FullscreenMedia', { msg: message.msg })}
      role='button'
      className='media-attachment-media'
    >
      <img className='attachment-content' src={attachment.url} />
    </div>
  )
}

function VideoAttachment({ message }: { message: MessageType }) {
  const { openDialog } = useContext(ScreenContext)
  const { attachment } = message.msg
  const hasSupportedFormat = isVideo(attachment)
  if (!attachment.url || !hasSupportedFormat) {
    return (
      <div
        className='media-attachment-media broken'
        onClick={() => openAttachmentInShell(message.msg)}
      >
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
      onClick={() => openDialog('FullscreenMedia', { msg: message.msg })}
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

function AudioAttachment({ message }: { message: MessageType }) {
  const { attachment } = message.msg
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

function FileAttachment({ message }: { message: MessageType }) {
  const { attachment } = message.msg
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
