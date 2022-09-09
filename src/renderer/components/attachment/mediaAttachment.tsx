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
import { makeContextMenu } from '../ContextMenu'
import { OpenDialogFunctionType } from '../dialogs/DialogController'
import { runtime } from '../../runtime'

import filesizeConverter from 'filesize'
import { jumpToMessage } from '../helpers/ChatMethods'
import { getLogger } from '../../../shared/logger'
import { truncateText } from '../../../shared/util'
import { Type } from '../../backend-com'

const log = getLogger('mediaAttachment')

export default function MediaAttachment({
  message,
}: {
  message: Type.Message
}) {
  if (!message.file) {
    return null
  }
  switch (message.viewType) {
    case 'Gif':
    case 'Image':
      return <ImageAttachment message={message} />
    case 'Video':
      return <VideoAttachment message={message} />
    case 'Audio':
    case 'Voice':
      return <AudioAttachment message={message} />
    case 'Webxdc':
      return <WebxdcAttachment message={message} />
    case 'File':
    default:
      return <FileAttachment message={message} />
  }
}

const hideOpenInShellTypes: Type.Viewtype[] = [
  'Gif',
  'Image',
  'Video',
  'Audio',
  'Voice',
  'Webxdc',
]

const contextMenuFactory = (
  message: Type.Message,
  openDialog: OpenDialogFunctionType
) => {
  const showCopyImage = message.viewType === 'Image'
  const tx = window.static_translate
  const { id: msgId, viewType } = message
  return [
    !hideOpenInShellTypes.includes(viewType) && {
      label: tx('open'),
      action: openAttachmentInShell.bind(null, message),
    },
    viewType === 'Webxdc' && {
      label: tx('start_app'),
      action: runtime.openWebxdc.bind(null, message.id),
    },
    {
      label: tx('save_as'),
      action: onDownload.bind(null, message),
    },
    showCopyImage && {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        message.file && runtime.writeClipboardImage(message.file)
      },
    },
    {
      label: tx('show_in_chat'),
      action: () => jumpToMessage(message.id),
    },
    {
      label: tx('menu_message_details'),
      action: openDialog.bind(null, 'MessageDetail', { id: msgId }),
    },
  ]
}

/** provides a quick link to comonly used functions to save a few duplicated lines  */
const useMediaActions = (message: Type.Message) => {
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

function ImageAttachment({ message }: { message: Type.Message }) {
  const { openContextMenu, openFullscreenMedia, openInShell } = useMediaActions(
    message
  )
  const { file, fileMime } = message
  const hasSupportedFormat = isImage(fileMime || '')
  const isBroken = !file || !hasSupportedFormat
  return (
    <div
      className={`media-attachment-media${isBroken ? ` broken` : ''}`}
      onClick={isBroken ? openInShell : openFullscreenMedia}
      onContextMenu={openContextMenu}
    >
      {isBroken ? (
        squareBrokenMediaContent(hasSupportedFormat, fileMime || '')
      ) : (
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(file)}
        />
      )}
    </div>
  )
}

function VideoAttachment({ message }: { message: Type.Message }) {
  const { openContextMenu, openFullscreenMedia, openInShell } = useMediaActions(
    message
  )
  const { fileMime, file } = message
  const hasSupportedFormat = isVideo(fileMime)
  const isBroken = !file || !hasSupportedFormat
  return (
    <div
      className={`media-attachment-media${isBroken ? ` broken` : ''}`}
      onClick={isBroken ? openInShell : openFullscreenMedia}
      onContextMenu={openContextMenu}
    >
      {isBroken ? (
        squareBrokenMediaContent(hasSupportedFormat, fileMime)
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

function AudioAttachment({ message }: { message: Type.Message }) {
  const { openContextMenu } = useMediaActions(message)
  const { fileMime, file } = message
  const hasSupportedFormat = isAudio(fileMime)
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
          <source src={runtime.transformBlobURL(file || '')} />
        </audio>
      ) : (
        <div>
          {window.static_translate(
            'cannot_display_unsuported_file_type',
            fileMime || 'null'
          )}
        </div>
      )}
    </div>
  )
}

function FileAttachment({ message }: { message: Type.Message }) {
  const { openContextMenu, openInShell } = useMediaActions(message)
  const { fileName, fileBytes, fileMime, file } = message
  const extension = getExtension(message)
  return (
    <div
      className='media-attachment-generic'
      role='button'
      onClick={ev => {
        ev.stopPropagation()
        openInShell()
      }}
      onContextMenu={openContextMenu}
    >
      <div
        className='file-icon'
        draggable='true'
        onDragStart={dragAttachmentOut.bind(null, file)}
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
        <div className='size'>
          {fileBytes ? filesizeConverter(fileBytes) : '?'}
        </div>
      </div>
    </div>
  )
}

function WebxdcAttachment({ message }: { message: Type.Message }) {
  const { openContextMenu } = useMediaActions(message)

  if (!message.webxdcInfo) {
    log.error('message.webxdcInfo is undefined, msgid:', message.id)
    return FileAttachment({ message })
  }

  const { summary, name, document } = message.webxdcInfo

  return (
    <div
      className='media-attachment-webxdc'
      role='button'
      onContextMenu={openContextMenu}
      onClick={runtime.openWebxdc.bind(null, message.id)}
    >
      <img className='icon' src={runtime.getWebxdcIconURL(message.id)} />
      <div className='text-part'>
        <div
          className='name'
          title={`${document ? document + ' \n' : ''}${name}`}
        >
          {document && truncateText(document, 25) + ' - '}
          {name}
        </div>
        <div className='summary'>{summary}</div>
      </div>
    </div>
  )
}
