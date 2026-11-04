import React, { useContext, useMemo, useState } from 'react'
import classNames from 'classnames'
import { filesize } from 'filesize'

import { openAttachmentInShell } from '../message/messageFunctions'
import {
  isDisplayableByFullscreenMedia,
  isImage,
  getExtension,
  dragAttachmentOut,
  MessageTypeAttachmentSubset,
} from './Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { Type } from '../../backend-com'
import FullscreenMedia, {
  NeighboringMediaMode,
} from '../dialogs/FullscreenMedia'
import useDialog from '../../hooks/dialog/useDialog'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import { AudioPlayer } from '../AudioPlayer'
import { NextVoiceMessagePlayerContext } from '../../contexts/NextVoiceMessagePlayerContext'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AudioAttachment as GalleryAudioAttachment } from './galleryAttachment'
import { selectedAccountId } from '../../ScreenController'
import { BackendRemote } from '../../backend-com'
import { useRpcFetch } from '../../hooks/useFetch'
import { useHasChanged2 } from '../../hooks/useHasChanged'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import Icon from '../Icon'
import {
  getImageDisplaySize,
  IMAGE_MIN_WIDTH,
  IMAGE_WITH_TEXT_MIN_WIDTH,
} from './imageDisplaySize'

import styles from './styles.module.css'

type AttachmentProps = {
  text?: string
  message: Type.Message
  tabindexForInteractiveContents: -1 | 0
}

/**
 * Images whose uncompressed pixel count exceeds this threshold are
 * not rendered inline since they cause severe UI slowness.
 * We set 50 MP as limit, which should be fine in most cases
 */
export const LARGE_IMAGE_PIXEL_THRESHOLD = 50_000_000

export default function Attachment({
  text,
  message,
  tabindexForInteractiveContents,
}: AttachmentProps) {
  const { openDialog } = useDialog()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()
  if (!message.file) {
    return null
  }
  const onClickAttachment = async (ev: any) => {
    ev.stopPropagation()
    if (message.viewType === 'Sticker') {
      const confirmed = await openConfirmationDialog({
        message: tx('ask_add_sticker_to_collection'),
        confirmLabel: tx('add_to_sticker_collection'),
      })
      if (confirmed) {
        BackendRemote.rpc.miscSaveSticker(
          selectedAccountId(),
          message.id,
          tx('saved')
        )
      }
      return
    }
    if (isDisplayableByFullscreenMedia(message.viewType)) {
      openDialog(FullscreenMedia, {
        msg: message,
        neighboringMedia: NeighboringMediaMode.Chat,
      })
    } else {
      openAttachmentInShell(message)
    }
  }

  const maxStickerSize = 200

  const withCaption = Boolean(text)
  // For attachments which aren't full-frame
  const withContentBelow = withCaption

  const isOversizedImage =
    isImage(message.viewType) &&
    message.dimensionsWidth > 0 &&
    message.dimensionsHeight > 0 &&
    message.dimensionsWidth * message.dimensionsHeight >
      LARGE_IMAGE_PIXEL_THRESHOLD

  if (
    (isImage(message.viewType) || message.viewType === 'Sticker') &&
    !isOversizedImage
  ) {
    const isSticker = message.viewType === 'Sticker'
    const size = isSticker
      ? {
          width: maxStickerSize,
          height: maxStickerSize,
          visibleFraction: 1,
          blurredFill: false,
        }
      : getImageDisplaySize(
          message.dimensionsWidth,
          message.dimensionsHeight,
          withCaption
        )
    const src = runtime.transformBlobURL(message.file)
    // used in CSS to limit the height to the window height,
    // see `.attachment-content` in _message-attachment.scss
    const heightLimitVars = isSticker
      ? undefined
      : ({
          '--image-ratio': size.width / size.height,
          '--image-min-width': `${
            withCaption && !size.blurredFill
              ? IMAGE_WITH_TEXT_MIN_WIDTH
              : IMAGE_MIN_WIDTH
          }px`,
        } as React.CSSProperties)
    return (
      <button
        type='button'
        onClick={onClickAttachment}
        tabIndex={tabindexForInteractiveContents}
        className={classNames(
          'message-attachment-media',
          withCaption ? 'content-below' : null
        )}
        style={heightLimitVars}
      >
        {size.blurredFill && (
          <img className={styles.blurredFill} src={src} alt='' aria-hidden />
        )}
        <img
          className={classNames(
            'attachment-content',
            isSticker ? 'sticker' : null,
            size.blurredFill ? styles.aboveBlurredFill : null
          )}
          src={src}
          width={size.width}
          height={size.height}
          // keeps the ratio if the width shrinks with the message bubble
          style={{ aspectRatio: `${size.width} / ${size.height}` }}
        />
        {size.visibleFraction < 1 ? (
          <span
            className={styles.croppedIndicator}
            role='img'
            aria-label={tx('image_cropped')}
            title={tx('image_cropped')}
          >
            <Icon icon='open_in_full' coloring='currentColor' size={16} />
          </span>
        ) : (
          !isSticker && (
            // only visible if the window is too low to show the whole image,
            // CSS can't tell screen readers about that
            <span
              className={classNames(
                styles.croppedIndicator,
                styles.croppedInLowWindow
              )}
              aria-hidden
            >
              <Icon icon='open_in_full' coloring='currentColor' size={16} />
            </span>
          )
        )}
      </button>
    )
  } else if (message.viewType === 'Video') {
    // the native fullscreen option is better right now so we don't need to open our own one
    return (
      <div
        className={classNames(
          'message-attachment-media',
          'video',
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
  } else if (message.viewType === 'Audio' || message.viewType === 'Voice') {
    return (
      <div
        className={classNames(
          'message-attachment-audio',
          withContentBelow ? 'content-below' : null
        )}
      >
        <AudioAttachment
          // Help TypeScript out a little.
          message={message as typeof message & { file: typeof message.file }}
          tabindexForInteractiveContents={tabindexForInteractiveContents}
        />
      </div>
    )
  }

  // Generic file renderer - (also used for oversized images)
  const { fileName, fileBytes, fileMime, file } = message
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
        onDragStart={ev => dragAttachmentOut(file, fileName, ev)}
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
/**
 * @see also {@linkcode GalleryAudioAttachment}.
 */
function AudioAttachment(props: {
  message: Type.Message & { file: string }
  tabindexForInteractiveContents: number
}) {
  const nextVoiceMessagePlayerCtx = useContext(NextVoiceMessagePlayerContext)
  const src = useMemo(
    () => runtime.transformBlobURL(props.message.file),
    [props.message.file]
  )

  return (
    <AudioPlayer
      src={src}
      // Despite the element having multiple interactive
      // (pseudo?) elements inside of it, tabindex applies to all of them.
      tabIndex={props.tabindexForInteractiveContents}
      onPlayNonProgrammatic={() =>
        nextVoiceMessagePlayerCtx.setCurrMessage({
          accountId: selectedAccountId(),
          chatId: props.message.chatId,
          messageId: props.message.id,
          src,
        })
      }
    />
  )
}

export function DraftAttachment({
  attachment,
}: {
  attachment: MessageTypeAttachmentSubset
}) {
  const tx = useTranslationFunction()
  const isViewTypeWebxdc = attachment.viewType === 'Webxdc'
  const [attachmentIdToLoad, setAttachmentIdToLoad] = useState(attachment.id)
  const webxdcInfoFetch = useRpcFetch(
    BackendRemote.rpc.getWebxdcInfo,
    isViewTypeWebxdc ? [selectedAccountId(), attachmentIdToLoad] : null
  )
  const hasFileNameChanged = useHasChanged2(attachment.fileName)
  if (
    (hasFileNameChanged || webxdcInfoFetch?.result?.ok === false) &&
    attachmentIdToLoad !== attachment.id
  ) {
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
  if (isImage(attachment.viewType)) {
    return (
      <div className={classNames('message-attachment-media')}>
        <img
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.file || '')}
        />
      </div>
    )
  } else if (attachment.viewType === 'Video') {
    return (
      <div className={classNames('message-attachment-media')}>
        <video
          className='attachment-content'
          src={runtime.transformBlobURL(attachment.file || '')}
          controls
        />
      </div>
    )
  } else if (
    attachment.viewType === 'Audio' ||
    attachment.viewType === 'Voice'
  ) {
    return <AudioPlayer src={runtime.transformBlobURL(attachment.file || '')} />
  } else if (isViewTypeWebxdc) {
    const iconUrl = runtime.getWebxdcIconURL(selectedAccountId(), attachment.id)
    return (
      <div className='media-attachment-webxdc'>
        <img className='icon' src={iconUrl} alt='' />
        <div className='text-part'>
          <div className='name'>
            {/* `webxdcInfoFetch` is never `null` here, but TypeScript
            doesn't know it. */}
            {webxdcInfoFetch?.loading
              ? tx('loading')
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
          onDragStart={ev => file && dragAttachmentOut(file, fileName, ev)}
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
