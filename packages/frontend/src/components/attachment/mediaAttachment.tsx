import React, { useContext, useRef } from 'react'
import { filesize } from 'filesize'

import {
  openAttachmentInShell,
  onDownload,
  openWebxdc,
} from '../message/messageFunctions'
import {
  isImage,
  isVideo,
  isAudio,
  getExtension,
  dragAttachmentOut,
} from './Attachment'
import Timestamp from '../conversations/Timestamp'
import { makeContextMenu, OpenContextMenu } from '../ContextMenu'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '../../../../shared/logger'
import { truncateText } from '@deltachat-desktop/shared/util'
import { selectedAccountId } from '../../ScreenController'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useMessage from '../../hooks/chat/useMessage'
import MessageDetail from '../dialogs/MessageDetail/MessageDetail'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import AudioPlayer from '../AudioPlayer'

import type { T } from '@deltachat/jsonrpc-client'
import type { OpenDialog } from '../../contexts/DialogContext'
import type { JumpToMessage, DeleteMessage } from '../../hooks/chat/useMessage'
import { useRovingTabindex } from '../../contexts/RovingTabindex'
import ConfirmDeleteMessageDialog from '../dialogs/ConfirmDeleteMessage'
import { BackendRemote } from '../../backend-com'
import { useRpcFetch } from '../../hooks/useFetch'

const log = getLogger('mediaAttachment')

const hideOpenInShellTypes: T.Viewtype[] = [
  'Gif',
  'Image',
  'Video',
  'Audio',
  'Voice',
  'Webxdc',
]

const contextMenuFactory = (
  message: T.Message,
  accountId: number,
  openDialog: OpenDialog,
  jumpToMessage: JumpToMessage
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
      action: openWebxdc.bind(null, message, undefined),
    },
    {
      label: tx('menu_export_attachment'),
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
      action: () =>
        jumpToMessage({
          accountId,
          msgId: message.id,
          msgChatId: message.chatId,
          focus: true,
          scrollIntoViewArg: { block: 'center' },
        }),
    },
    {
      label: tx('info'),
      action: () => {
        openDialog(MessageDetail, { id: msgId })
      },
    },
    {
      label: tx('delete'),
      action: async () => {
        const chat = await BackendRemote.rpc.getFullChatById(
          accountId,
          message.chatId
        )
        openDialog(ConfirmDeleteMessageDialog, {
          accountId,
          msg: message,
          chat,
        })
      },
    },
  ]
}

/** provides a quick link to commonly used functions to save a few duplicated lines  */
const getMediaActions = (
  openContextMenu: OpenContextMenu,
  openDialog: OpenDialog,
  jumpToMessage: JumpToMessage,
  message: T.Message,
  accountId: number
) => {
  return {
    openContextMenu: makeContextMenu(
      contextMenuFactory.bind(
        null,
        message,
        accountId,
        openDialog,
        jumpToMessage
      ),
      openContextMenu
    ),
    downloadMedia: onDownload.bind(null, message),
    openInShell: openAttachmentInShell.bind(null, message),
  }
}

function getBrokenMediaContextMenu(
  openContextMenu: OpenContextMenu,
  openDialog: OpenDialog,
  deleteMessage: DeleteMessage,
  messageId: number,
  accountId: number
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
            cb: (yes: boolean) => yes && deleteMessage(accountId, messageId),
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
  messageId: number
  loadResult: T.MessageLoadResult
}

export function ImageAttachment({
  messageId,
  loadResult,
  openFullscreenMedia,
}: GalleryAttachmentElementProps & {
  openFullscreenMedia: (message: T.Message) => void
}) {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()
  const contextMenu = useContext(ContextMenuContext)
  const { jumpToMessage, deleteMessage } = useMessage()
  const accountId = selectedAccountId()

  // `<any>` because TypeScript and React don't like
  // `HTMLButtonElement | HTMLDivElement`.
  // Same goes for other occurences in this file.
  const interactiveElRef = useRef<any>(null)
  const rovingTabindex = useRovingTabindex(interactiveElRef)
  const rovingTabindexProps = {
    onKeyDown: rovingTabindex.onKeydown,
    onFocus: rovingTabindex.setAsActiveElement,
    tabIndex: rovingTabindex.tabIndex,
  } as const

  if (loadResult.kind === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(
      contextMenu.openContextMenu,
      openDialog,
      deleteMessage,
      messageId,
      accountId
    )

    return (
      <div
        ref={interactiveElRef}
        className={'media-attachment-media broken ' + rovingTabindex.className}
        title={loadResult.error}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
      >
        <div className='attachment-content'>
          {tx('attachment_failed_to_load')}
        </div>
      </div>
    )
  } else {
    const message = loadResult
    const { openContextMenu, openInShell } = getMediaActions(
      contextMenu.openContextMenu,
      openDialog,
      jumpToMessage,
      message,
      accountId
    )
    const { file, fileMime } = message
    const hasSupportedFormat = isImage(fileMime)
    const isBroken = !file || !hasSupportedFormat

    return (
      <button
        type='button'
        ref={interactiveElRef}
        className={`media-attachment-media${isBroken ? ` broken` : ''} ${
          rovingTabindex.className
        }`}
        onClick={
          isBroken ? openInShell : openFullscreenMedia.bind(null, message)
        }
        onContextMenu={openContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
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
      </button>
    )
  }
}

export function VideoAttachment({
  messageId,
  loadResult,
  openFullscreenMedia,
}: GalleryAttachmentElementProps & {
  openFullscreenMedia: (message: T.Message) => void
}) {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()
  const contextMenu = useContext(ContextMenuContext)
  const { deleteMessage, jumpToMessage } = useMessage()
  const accountId = selectedAccountId()

  const interactiveElRef = useRef<any>(null)
  const rovingTabindex = useRovingTabindex(interactiveElRef)
  const rovingTabindexProps = {
    onKeyDown: rovingTabindex.onKeydown,
    onFocus: rovingTabindex.setAsActiveElement,
    tabIndex: rovingTabindex.tabIndex,
  } as const

  if (loadResult.kind === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(
      contextMenu.openContextMenu,
      openDialog,
      deleteMessage,
      messageId,
      accountId
    )

    return (
      <div
        ref={interactiveElRef}
        className={'media-attachment-media broken ' + rovingTabindex.className}
        title={loadResult.error}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
      >
        <div className='attachment-content'>
          {tx('attachment_failed_to_load')}
        </div>
      </div>
    )
  } else {
    const message = loadResult
    const { openContextMenu, openInShell } = getMediaActions(
      contextMenu.openContextMenu,
      openDialog,
      jumpToMessage,
      message,
      accountId
    )
    const { file, fileMime } = message
    const hasSupportedFormat = isVideo(fileMime)
    const isBroken = !file || !hasSupportedFormat
    return (
      <button
        type='button'
        ref={interactiveElRef}
        className={`media-attachment-media${isBroken ? ` broken` : ''} ${
          rovingTabindex.className
        }`}
        onClick={
          isBroken ? openInShell : openFullscreenMedia.bind(null, message)
        }
        onContextMenu={openContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
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
      </button>
    )
  }
}

export function AudioAttachment({
  messageId,
  loadResult,
}: GalleryAttachmentElementProps) {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()
  const contextMenu = useContext(ContextMenuContext)
  const { deleteMessage, jumpToMessage } = useMessage()
  const accountId = selectedAccountId()

  const interactiveElRef = useRef<any>(null)
  const rovingTabindex = useRovingTabindex(interactiveElRef)
  const rovingTabindexProps = {
    onKeyDown: rovingTabindex.onKeydown,
    onFocus: rovingTabindex.setAsActiveElement,
    tabIndex: rovingTabindex.tabIndex,
  } as const

  if (loadResult.kind === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(
      contextMenu.openContextMenu,
      openDialog,
      deleteMessage,
      messageId,
      accountId
    )
    return (
      <div
        ref={interactiveElRef}
        className={'media-attachment-audio broken ' + rovingTabindex.className}
        title={loadResult.error}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
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
    const message = loadResult
    const { openContextMenu } = getMediaActions(
      contextMenu.openContextMenu,
      openDialog,
      jumpToMessage,
      message,
      accountId
    )
    const { file, fileMime } = message
    const hasSupportedFormat = isAudio(fileMime)
    const isBroken = !file || !hasSupportedFormat
    return (
      <div
        ref={interactiveElRef}
        className={`media-attachment-audio${isBroken ? ` broken` : ''} ${
          rovingTabindex.className
        }`}
        onContextMenu={openContextMenu}
        aria-haspopup='menu'
        onKeyDown={e => {
          // Audio elements have controls that utilize
          // arrows. That is seeking, changing volume.
          // So we don't want to switch focus if all user wanted to do
          // is to seek the element.
          // So, let's only switch focus when this element
          // (and not one of its children) is focused.
          //
          // However, FYI, onKeyDown event doesn't appear to get triggered
          // when a sub-element of the <audio> element
          // (seek bar, volume slider), and not the <audio> element itself,
          // is focused. At least on Chromium.
          //
          // But, when the root (`<audio>`) element (and not on of its
          // sub-elements) is focused, it still listens for arrows
          // and performs seeking and volume changes,
          // so, still, let's only switch focus when this wrapper element
          // is focused (and not one of its children).
          //
          // The same goes for the `onKeyDown` code in `Message.tsx`.
          if (e.target !== e.currentTarget) {
            return
          }

          rovingTabindex.onKeydown(e)
        }}
        onFocus={rovingTabindex.setAsActiveElement}
        tabIndex={rovingTabindex.tabIndex}
      >
        <div className='heading'>
          <div className='name'>
            {message?.overrideSenderName
              ? `~${message.overrideSenderName}`
              : message?.sender?.displayName}
          </div>
          <Timestamp
            timestamp={message?.timestamp * 1000}
            extended
            module='date'
          />
        </div>
        {hasSupportedFormat ? (
          <AudioPlayer
            src={runtime.transformBlobURL(file || '')}
            // Despite the element having multiple interactive
            // (pseudo?) elements inside of it, tabindex applies to all of them.
            tabIndex={rovingTabindex.tabIndex}
          />
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
  messageId,
  loadResult,
  queryText,
}: GalleryAttachmentElementProps & { queryText?: string }) {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()
  const contextMenu = useContext(ContextMenuContext)
  const { deleteMessage, jumpToMessage } = useMessage()
  const accountId = selectedAccountId()

  const interactiveElRef = useRef<any>(null)
  const rovingTabindex = useRovingTabindex(interactiveElRef)
  const rovingTabindexProps = {
    onKeyDown: rovingTabindex.onKeydown,
    onFocus: rovingTabindex.setAsActiveElement,
    tabIndex: rovingTabindex.tabIndex,
  } as const

  if (loadResult.kind === 'loadingError') {
    const onContextMenu = getBrokenMediaContextMenu(
      contextMenu.openContextMenu,
      openDialog,
      deleteMessage,
      messageId,
      accountId
    )

    return (
      <div
        ref={interactiveElRef}
        className={
          'media-attachment-generic broken ' + rovingTabindex.className
        }
        title={loadResult.error}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
      >
        <div className='file-icon'>
          <div className='file-extension'>?</div>
        </div>

        <div className='name'>{tx('attachment_failed_to_load')}</div>
        <div className='size'>{'?'}</div>
        <div className='date'>{'?'}</div>
      </div>
    )
  } else {
    const message = loadResult
    const { openContextMenu, openInShell } = getMediaActions(
      contextMenu.openContextMenu,
      openDialog,
      jumpToMessage,
      message,
      accountId
    )
    const { fileName, fileBytes, fileMime, file, timestamp } = message

    const extension = getExtension(message)
    return (
      <button
        type='button'
        ref={interactiveElRef}
        className={'media-attachment-generic ' + rovingTabindex.className}
        onClick={ev => {
          ev.stopPropagation()
          openInShell()
        }}
        onContextMenu={openContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
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

        <div className='name'>
          {queryText && fileName
            ? highlightQuery(fileName, queryText)
            : fileName}
        </div>
        <div className='size'>{filesize(fileBytes ?? 0)}</div>
        <div className='date'>
          <Timestamp
            timestamp={timestamp * 1000}
            module={''}
            extended={false}
          />
        </div>
      </button>
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
  messageId,
  loadResult,
}: GalleryAttachmentElementProps) {
  const { openDialog } = useDialog()
  const contextMenu = useContext(ContextMenuContext)
  const { jumpToMessage, deleteMessage } = useMessage()
  const accountId = selectedAccountId()

  const interactiveElRef = useRef<any>(null)
  const rovingTabindex = useRovingTabindex(interactiveElRef)
  const rovingTabindexProps = {
    onKeyDown: rovingTabindex.onKeydown,
    onFocus: rovingTabindex.setAsActiveElement,
    tabIndex: rovingTabindex.tabIndex,
  } as const

  const webxdcInfoFetch = useRpcFetch(
    BackendRemote.rpc.getWebxdcInfo,
    loadResult.kind === 'message' ? [accountId, messageId] : null
  )
  if (webxdcInfoFetch?.result?.ok === false) {
    log.error(
      `Failed to load webxdc info for message:
      messageId: ${messageId},
      accountId: ${accountId},
      error: ${webxdcInfoFetch.result.err}`
    )
  }
  const webxdcInfo = webxdcInfoFetch?.result?.ok
    ? webxdcInfoFetch.result.value
    : null

  if (webxdcInfoFetch?.loading) {
    const onContextMenu = getBrokenMediaContextMenu(
      contextMenu.openContextMenu,
      openDialog,
      deleteMessage,
      messageId,
      accountId
    )
    return (
      <div
        ref={interactiveElRef}
        className={'media-attachment-webxdc ' + rovingTabindex.className}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
      >
        <img
          className='icon'
          src={runtime.getWebxdcIconURL(selectedAccountId(), messageId)}
        />
        <div className='text-part'>
          <div className='name'>Loading...</div>
          <div className='summary'></div>
        </div>
      </div>
    )
  } else if (webxdcInfo == null || loadResult.kind !== 'message') {
    const onContextMenu = getBrokenMediaContextMenu(
      contextMenu.openContextMenu,
      openDialog,
      deleteMessage,
      messageId,
      accountId
    )
    log.error('webxdcInfo is not available, msgid:', messageId)

    return (
      <div
        ref={interactiveElRef}
        className={'media-attachment-webxdc broken' + rovingTabindex.className}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        {...rovingTabindexProps}
      >
        <img
          className='icon'
          src={runtime.getWebxdcIconURL(selectedAccountId(), messageId)}
        />
        <div className='text-part'>
          <div className='name'>Error loading info</div>
          <div className='summary'>
            {'webxdcInfo is not available!, msgid:' + messageId}
          </div>
        </div>
      </div>
    )
  } else {
    const { openContextMenu } = getMediaActions(
      contextMenu.openContextMenu,
      openDialog,
      jumpToMessage,
      loadResult,
      accountId
    )
    const { summary, name, document } = webxdcInfo
    return (
      <button
        type='button'
        ref={interactiveElRef}
        className={'media-attachment-webxdc ' + rovingTabindex.className}
        onContextMenu={openContextMenu}
        aria-haspopup='menu'
        onClick={openWebxdc.bind(null, loadResult, webxdcInfo ?? undefined)}
        {...rovingTabindexProps}
      >
        <img
          className='icon'
          src={runtime.getWebxdcIconURL(selectedAccountId(), loadResult.id)}
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
      </button>
    )
  }
}
