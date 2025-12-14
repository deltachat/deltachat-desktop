import React, { useState } from 'react'
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
import { getDirection } from '../../utils/getDirection'
import { Type } from '../../backend-com'
import FullscreenMedia, {
  NeighboringMediaMode,
} from '../dialogs/FullscreenMedia'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import AudioPlayer from '../AudioPlayer'
import { T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../ScreenController'
import { BackendRemote } from '../../backend-com'
import { useRpcFetch } from '../../hooks/useFetch'
import { useHasChanged2 } from '../../hooks/useHasChanged'

type AttachmentProps = {
  text?: string
  message: Type.Message
  tabindexForInteractiveContents: -1 | 0
}

export default function Attachment({
  text,
  message,
  tabindexForInteractiveContents,
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

  /**
   * height has to be calculated before images are loaded to enable
   * the virtual list to calculate the correct height of all messages
   *
   * if the image exceeds the maximal width or height it will be scaled down
   * if the image exceeds the minimal width or height it will be scaled up
   *
   * if after resizing one dimension exceeds a maximum it will be cropped
   * by css rules: max-width/max-height with object-fit: cover
   */
  const calculateHeight = (
    message: Pick<
      T.Message,
      'dimensionsHeight' | 'dimensionsWidth' | 'viewType'
    >
  ): number => {
    const minWidth = 200 // needed for readable footer & reactions
    const minHeight = 50 // needed for readable footer
    const maxLandscapeWidth = 450 // also set by css
    const maxPortraitHeight = 450 // also set by css
    const stickerHeight = 200

    if (message.viewType === 'Sticker') {
      return stickerHeight
    }

    const height = message.dimensionsHeight
    const width = message.dimensionsWidth
    const portrait = isPortrait(message)
    let finalHeight: number
    if (portrait) {
      // limit height if needed
      finalHeight = Math.min(height, maxPortraitHeight)
      if (height < maxPortraitHeight) {
        if ((finalHeight / height) * width < minWidth) {
          // stretch image to have minWidth
          finalHeight = (height / width) * minWidth
        }
      }
    } else {
      // make sure image is not wider than maxWidth
      finalHeight = Math.min(height, (maxLandscapeWidth / width) * height)
      if ((finalHeight / height) * width < minWidth) {
        // stretch image to have minWidth
        finalHeight = (height / width) * minWidth
      }
      if (finalHeight < minHeight) {
        finalHeight = minHeight
      }
    }
    return finalHeight
  }

  const isPortrait = (
    message: Pick<T.Message, 'dimensionsHeight' | 'dimensionsWidth'>
  ): boolean => {
    if (message.dimensionsHeight === 0 || message.dimensionsWidth === 0) {
      return false
    }
    return message.dimensionsHeight > message.dimensionsWidth
  }

  const withCaption = Boolean(text)
  // For attachments which aren't full-frame
  const withContentBelow = withCaption
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
        type='button'
        onClick={onClickAttachment}
        tabIndex={tabindexForInteractiveContents}
        className={classNames(
          'message-attachment-media',
          withCaption ? 'content-below' : null
        )}
      >
        <img
          className={classNames(
            'attachment-content',
            isPortrait(message) ? 'portrait' : null,
            message.viewType === 'Sticker' ? 'sticker' : null
          )}
          src={runtime.transformBlobURL(message.file)}
          height={calculateHeight(message)}
        />
      </button>
    )
  } else if (isVideo(message.fileMime)) {
    if (!message.file) {
      return (
        <button
          type='button'
          onClick={onClickAttachment}
          tabIndex={tabindexForInteractiveContents}
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
          withCaption ? 'content-below' : null
        )}
      >
        <video
          className='attachment-content video-content'
          src={runtime.transformBlobURL(message.file)}
          controls={true}
          // Despite the element having multiple interactive
          // (pseudo?) elements inside of it, tabindex applies to all of them.
          tabIndex={tabindexForInteractiveContents}
        />
      </div>
    )
  } else if (isAudio(message.fileMime)) {
    return (
      <div
        className={classNames(
          'message-attachment-audio',
          withContentBelow ? 'content-below' : null
        )}
      >
        <AudioPlayer
          src={runtime.transformBlobURL(message.file)}
          // Despite the element having multiple interactive
          // (pseudo?) elements inside of it, tabindex applies to all of them.
          tabIndex={tabindexForInteractiveContents}
        />
      </div>
    )
  } else {
    const { fileName, fileBytes, fileMime } = message
    const extension = getExtension(message)
    return (
      <button
        type='button'
        className={classNames(
          'message-attachment-generic',
          withContentBelow ? 'content-below' : null
        )}
        onClick={onClickAttachment}
        tabIndex={tabindexForInteractiveContents}
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
          <div className='size'>{filesize(fileBytes ?? 0)}</div>
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
  const isViewTypeWebxdc = attachment.viewType === 'Webxdc'
  const [attachmentIdToLoad, setAttachmentIdToLoad] = useState(attachment.id)
  const webxdcInfoFetch = useRpcFetch(
    BackendRemote.rpc.getWebxdcInfo,
    isViewTypeWebxdc ? [selectedAccountId(), attachmentIdToLoad] : null
  )
  const hasFileNameChanged = useHasChanged2(attachment.fileName)
  if (hasFileNameChanged || webxdcInfoFetch?.result?.ok === false) {
    // Only reload webxdc info if filename has changed, because
    // the `id` itself could be changing as often as we update the draft.
    //
    // Additionally, since this is a draft message, a draft could get replaced,
    // i.e. the draft message could get deleted. If that happens,
    // the fetch will fail. In such a case let's also make sure
    // that we're fetching the latest draft.
    setAttachmentIdToLoad(attachment.id)
  }

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
  } else if (isViewTypeWebxdc) {
    const iconUrl = runtime.getWebxdcIconURL(selectedAccountId(), attachment.id)
    return (
      <div className='media-attachment-webxdc'>
        <img className='icon' src={iconUrl} alt='app icon' />
        <div className='text-part'>
          <div className='name'>
            {/* `webxdcInfoFetch` is never `null` here, but TypeScript
            doesn't know it. */}
            {webxdcInfoFetch?.loading
              ? 'Loading...'
              : webxdcInfoFetch?.result.ok
                ? webxdcInfoFetch.result.value.name
                : 'Unknown App'}
          </div>
          <div className='size'>{filesize(attachment.fileBytes ?? 0)}</div>
        </div>
      </div>
    )
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
          <div className='size'>{filesize(fileBytes ?? 0)}</div>
        </div>
      </div>
    )
  }
}
