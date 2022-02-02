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
import { makeContextMenu } from '../ContextMenu'
import { OpenDialogFunctionType } from '../dialogs/DialogController'
import { runtime } from '../../runtime'

import filesizeConverter from 'filesize'

export default function MediaAttachment({ message }: { message: MessageType }) {
  if (!message.file) {
    return null
  }
  switch (message.viewType) {
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

const hideOpenInShellTypes = [
  C.DC_MSG_GIF,
  C.DC_MSG_IMAGE,
  C.DC_MSG_VIDEO,
  C.DC_MSG_AUDIO,
  C.DC_MSG_VOICE,
]

const contextMenuFactory = (
  message: MessageType,
  openDialog: OpenDialogFunctionType
) => {
  const showCopyImage = message.viewType === C.DC_MSG_IMAGE
  const tx = window.static_translate
  const { id: msgId, viewType } = message
  return [
    !hideOpenInShellTypes.includes(viewType) && {
      label: tx('open'),
      action: openAttachmentInShell.bind(null, message),
    },
    {
      label: tx('save'),
      action: onDownload.bind(null, message),
    },
    showCopyImage && {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        runtime.writeClipboardImage(message.file)
      },
    },
    // {
    //   label: tx('jump_to_message'),
    //   action: ()=>alert('not implemented yet')
    // },
    {
      label: tx('menu_message_details'),
      action: openDialog.bind(null, 'MessageDetail', { id: msgId }),
    },
  ]
}

/** provides a quick link to comonly used functions to save a few duplicated lines  */
const useMediaActions = (message: MessageType) => {
  const { openDialog, openContextMenu } = useContext(ScreenContext)
  return {
    openContextMenu: makeContextMenu(
      contextMenuFactory.bind(null, message, openDialog),
      openContextMenu
    ),
    openFullscreenMedia: openDialog.bind(null, 'FullscreenMedia', {
      msg: message,
    }),
    downloadMedia: onDownload.bind(null, message),
    openInShell: openAttachmentInShell.bind(null, message),
  }
}

function squareBrokenMediaContent(
  hasSupportedFormat: boolean,
  contentType: string | null
) {
  const tx = window.static_translate
  return (
    <div className='attachment-content'>
      {hasSupportedFormat
        ? tx('attachment_failed_to_load')
        : tx('cannot_display_unsuported_file_type', contentType || 'null')}
    </div>
  )
}

function ImageAttachment({ message }: { message: MessageType }) {
  const { openContextMenu, openFullscreenMedia, openInShell } = useMediaActions(
    message
  )
  const { file, file_mime } = message
  const hasSupportedFormat = isImage(file_mime || '')
  const isBroken = !file || !hasSupportedFormat
  return (
    <div
      className={`media-attachment-media${isBroken ? ` broken` : ''}`}
      onClick={isBroken ? openInShell : openFullscreenMedia}
      onContextMenu={openContextMenu}
    >
      {isBroken ? (
        squareBrokenMediaContent(hasSupportedFormat, file_mime || '')
      ) : (
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(file)}
        />
      )}
    </div>
  )
}

function VideoAttachment({ message }: { message: MessageType }) {
  const { openContextMenu, openFullscreenMedia, openInShell } = useMediaActions(
    message
  )
  const { file_mime, file } = message
  const hasSupportedFormat = isVideo(file_mime)
  const isBroken = !file || !hasSupportedFormat
  return (
    <div
      className={`media-attachment-media${isBroken ? ` broken` : ''}`}
      onClick={isBroken ? openInShell : openFullscreenMedia}
      onContextMenu={openContextMenu}
    >
      {isBroken ? (
        squareBrokenMediaContent(hasSupportedFormat, file_mime)
      ) : (
        <>
          <video
            className='attachment-content'
            src={runtime.transformBlobURL(file)}
            controls={false}
          />
          <div className='video-play-btn'>
            <div className='video-play-btn-icon' />
          </div>
        </>
      )}
    </div>
  )
}

function AudioAttachment({ message }: { message: MessageType }) {
  const { openContextMenu } = useMediaActions(message)
  const { file_mime, file } = message
  const hasSupportedFormat = isAudio(file_mime)
  return (
    <div className='media-attachment-audio' onContextMenu={openContextMenu}>
      <div className='heading'>
        <div className='name'>{message?.sender.displayName}</div>
        <Timestamp
          timestamp={message?.timestamp * 1000}
          extended
          module='date'
        />
      </div>
      {hasSupportedFormat ? (
        <audio controls>
          <source src={runtime.transformBlobURL(file)} />
        </audio>
      ) : (
        <div>
          {window.static_translate(
            'cannot_display_unsuported_file_type',
            file_mime || 'null'
          )}
        </div>
      )}
    </div>
  )
}

function FileAttachment({ message }: { message: MessageType }) {
  const { openContextMenu, downloadMedia, openInShell } = useMediaActions(
    message
  )
  const { file_name, file_bytes, file_mime, file } = message
  const extension = getExtension(message)
  return (
    <div
      className='media-attachment-generic'
      role='button'
      onClick={downloadMedia}
      onContextMenu={openContextMenu}
    >
      <div
        className='file-icon'
        draggable='true'
        onClick={ev => {
          ev.stopPropagation()
          openInShell()
        }}
        onDragStart={dragAttachmentOut.bind(null, file)}
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
