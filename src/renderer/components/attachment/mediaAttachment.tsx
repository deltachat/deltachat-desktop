import React, { useContext } from 'react'
import {
  openAttachmentInShell,
  onDownload,
  openWebxdc,
} from '../message/messageFunctions'
import { ScreenContext, unwrapContext } from '../../contexts'
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
import { deleteMessage, jumpToMessage } from '../helpers/ChatMethods'
import { getLogger } from '../../../shared/logger'
import { truncateText } from '../../../shared/util'
import { Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'

const log = getLogger('mediaAttachment')

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
      action: openWebxdc.bind(null, message.id),
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
    {
      label: tx('delete'),
      action: () =>
        openDialog(ConfirmationDialog, {
          message: tx('ask_delete_message'),
          confirmLabel: tx('delete'),
          cb: (yes: boolean) => yes && deleteMessage(msgId),
        }),
    },
  ]
}

/** provides a quick link to comonly used functions to save a few duplicated lines  */
const getMediaActions = (
  { openDialog, openContextMenu }: unwrapContext<typeof ScreenContext>,
  message: Type.Message
) => {
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

function getBrokenMediaContextMenu(
  { openContextMenu, openDialog }: unwrapContext<typeof ScreenContext>,
  msgId: number
) {
  const tx = window.static_translate
  return makeContextMenu(
    [
      {
        label: tx('delete'),
        action: () =>
          openDialog(ConfirmationDialog, {
            message: tx('ask_delete_message'),
            confirmLabel: tx('delete'),
            cb: (yes: boolean) => yes && deleteMessage(msgId),
          }),
      },
    ],
    openContextMenu
  )
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

export type GalleryAttachmentElementProps = {
  msgId: number
  load_result: Type.MessageLoadResult
}

export function ImageAttachment({
  msgId,
  load_result,
}: GalleryAttachmentElementProps) {
  const screenContext = useContext(ScreenContext)
  const tx = window.static_translate

  if (load_result.variant === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(screenContext, msgId)
    return (
      <div
        className={'media-attachment-media broken'}
        title={load_result.error}
        onContextMenu={onContextMenu}
      >
        <div className='attachment-content'>
          {tx('attachment_failed_to_load')}
        </div>
      </div>
    )
  } else {
    const message = load_result
    const {
      openContextMenu,
      openFullscreenMedia,
      openInShell,
    } = getMediaActions(screenContext, message)
    const { file, fileMime } = message
    const hasSupportedFormat = isImage(fileMime)
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
          <img
            className='attachment-content'
            src={runtime.transformBlobURL(file)}
            loading='lazy'
          />
        )}
      </div>
    )
  }
}

export function VideoAttachment({
  msgId,
  load_result,
}: GalleryAttachmentElementProps) {
  const screenContext = useContext(ScreenContext)
  const tx = window.static_translate

  if (load_result.variant === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(screenContext, msgId)
    return (
      <div
        className={'media-attachment-media broken'}
        title={load_result.error}
        onContextMenu={onContextMenu}
      >
        <div className='attachment-content'>
          {tx('attachment_failed_to_load')}
        </div>
      </div>
    )
  } else {
    const message = load_result
    const {
      openContextMenu,
      openFullscreenMedia,
      openInShell,
    } = getMediaActions(screenContext, message)
    const { file, fileMime } = message
    const hasSupportedFormat = isVideo(fileMime)
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
}

export function AudioAttachment({
  msgId,
  load_result,
}: GalleryAttachmentElementProps) {
  const screenContext = useContext(ScreenContext)
  const tx = window.static_translate

  if (load_result.variant === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(screenContext, msgId)
    return (
      <div
        className={'media-attachment-audio broken'}
        title={load_result.error}
        onContextMenu={onContextMenu}
      >
        <div className='heading'>
          <div className='name'>? Error ?</div>
          <span className='date'>?</span>
        </div>
        <div className='attachment-content'>
          {tx('attachment_failed_to_load')}
        </div>
      </div>
    )
  } else {
    const message = load_result
    const { openContextMenu } = getMediaActions(screenContext, message)
    const { file, fileMime } = message
    const hasSupportedFormat = isAudio(fileMime)
    const isBroken = !file || !hasSupportedFormat
    return (
      <div
        className={`media-attachment-audio${isBroken ? ` broken` : ''}`}
        onContextMenu={openContextMenu}
      >
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
}

export function FileAttachmentRow({
  msgId,
  load_result,
  queryText,
}: GalleryAttachmentElementProps & { queryText?: string }) {
  const screenContext = useContext(ScreenContext)
  const tx = window.static_translate

  if (load_result.variant === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(screenContext, msgId)
    return (
      <div
        className={'media-attachment-generic broken'}
        title={load_result.error}
        onContextMenu={onContextMenu}
      >
        <div className='file-icon'>
          <div className='file-extension'>?</div>
        </div>
        <div className='text-part'>
          <div className='name'>{tx('attachment_failed_to_load')}</div>
          <div className='size'>{'?'}</div>
        </div>
      </div>
    )
  } else {
    const message = load_result
    const { openContextMenu, openInShell } = getMediaActions(
      screenContext,
      message
    )
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
          <div className='name'>
            {queryText && fileName
              ? highlightQuery(fileName, queryText)
              : fileName}
          </div>
          <div className='size'>
            {fileBytes ? filesizeConverter(fileBytes) : '?'}
          </div>
        </div>
      </div>
    )
  }
}

const highlightQuery = (msg: string, query: string) => {
  const pos_of_search_term = msg.toLowerCase().indexOf(query.toLowerCase())
  if (pos_of_search_term == -1) return msg
  const text = msg
  const pos_of_search_term_in_text = pos_of_search_term

  const before = text.slice(0, pos_of_search_term_in_text)
  const search_term = text.slice(
    pos_of_search_term_in_text,
    pos_of_search_term_in_text + query.length
  )
  const after = text.slice(pos_of_search_term_in_text + query.length)

  return (
    <>
      {before}
      <span className='highlight'>{search_term}</span>
      {after}
    </>
  )
}

export function WebxdcAttachment({
  msgId,
  load_result,
}: GalleryAttachmentElementProps) {
  const screenContext = useContext(ScreenContext)
  const tx = window.static_translate

  if (load_result.variant === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(screenContext, msgId)
    return (
      <div
        className={'media-attachment-webxdc broken'}
        title={load_result.error}
        onContextMenu={onContextMenu}
      >
        <div className='icon'></div>
        <div className='text-part'>
          <div className='name'>{tx('attachment_failed_to_load')}</div>
          <div className='summary'></div>
        </div>
      </div>
    )
  } else if (load_result.webxdcInfo == null) {
    const onContextMenu = getBrokenMediaContextMenu(screenContext, msgId)
    // webxdc info is not set, show different error
    log.error('message.webxdcInfo is undefined, msgid:', msgId)
    return (
      <div
        className='media-attachment-webxdc'
        role='button'
        onContextMenu={onContextMenu}
      >
        <img
          className='icon'
          src={runtime.getWebxdcIconURL(selectedAccountId(), msgId)}
        />
        <div className='text-part'>
          <div className='name'>Error loading info</div>
          <div className='summary'>
            {'message.webxdcInfo is undefined, msgid:' + msgId}
          </div>
        </div>
      </div>
    )
  } else {
    const { openContextMenu } = getMediaActions(screenContext, load_result)
    const { summary, name, document } = load_result.webxdcInfo
    return (
      <div
        className='media-attachment-webxdc'
        role='button'
        onContextMenu={openContextMenu}
        onClick={openWebxdc.bind(null, load_result.id)}
      >
        <img
          className='icon'
          src={runtime.getWebxdcIconURL(selectedAccountId(), load_result.id)}
        />
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
}
