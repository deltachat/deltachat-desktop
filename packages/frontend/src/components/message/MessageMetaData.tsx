import React from 'react'
import classNames from 'classnames'
import { T } from '@deltachat/jsonrpc-client'

import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo } from '../attachment/Attachment'
import { msgStatus } from '../../types-app'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = {
  padlock: boolean
  fileMime: string | null
  direction?: 'incoming' | 'outgoing'
  status: msgStatus
  isEdited: boolean
  hasText: boolean
  timestamp: number
  hasLocation?: boolean
  onClickError?: () => void
  tabindexForInteractiveContents: -1 | 0
  viewType: T.Viewtype
  isSavedMessage: boolean
}

export default function MessageMetaData(props: Props) {
  const tx = useTranslationFunction()

  const {
    padlock,
    fileMime,
    direction,
    status,
    isEdited,
    hasText,
    timestamp,
    hasLocation,
    onClickError,
    tabindexForInteractiveContents,
    viewType,
    isSavedMessage,
  } = props

  return (
    <div
      className={classNames('metadata', {
        'with-image-no-caption': isMediaWithoutText(
          fileMime,
          hasText,
          viewType
        ),
      })}
    >
      {/* FYI the padlock doesn't need `aria-live`
      as we don't expect it to get removed. See
      https://github.com/deltachat/deltachat-desktop/pull/5023#discussion_r2059382983 */}
      {padlock && (
        <div
          aria-label={tx('a11y_encryption_padlock')}
          // We should not announce this for _every_ message.
          // This is available in the "Message info" dialog.
          // In addition, if the message is not encerypted,
          // we simply don't display the padlock,
          // but arguably "not encrypted" is more important of a status
          // than "encrypted".
          aria-hidden={true}
          className={'padlock-icon'}
        />
      )}
      <div
        className='aria-live-wrapper'
        aria-live='polite'
        // Also announce removals as to notify when a message gets unsaved.
        // AFAIK "saved" / "unsaved" changes only as a result of user action,
        // but let's do it for confirmation, and for future-proofing.
        aria-relevant='all'
      >
        {isSavedMessage && (
          <div aria-label={tx('saved')} className={'saved-message-icon'} />
        )}
      </div>
      {hasLocation && <span className={'location-icon'} />}
      <div className='aria-live-wrapper' aria-live='polite'>
        {isEdited && <span className='edited'>{tx('edited')}</span>}
      </div>
      <Timestamp
        timestamp={timestamp}
        extended
        direction={direction}
        module='date'
      />
      <span className='spacer' />
      {direction === 'outgoing' && (
        <button
          className={classNames('status-icon', status)}
          // The main point of `aria-live` here is to let the user know
          // that their message has been sent or delievered
          // right after they they send it.
          // We want at least some indication of something happening
          // after they press "Enter".
          // But this is also useful to announce when the message has been read.
          //
          // Note that this this applies to _all_ loaded messages
          // and not just the last one.
          //
          // TODO fix: NVDA announces the change twice for some reason,
          // even when you modify just `aria-label` through the dev tools.
          // We probably ought to keep `aria-label` fixed to "Delivery status",
          // and only update the content, i.e. "Delivered", "Read".
          aria-live='polite'
          aria-label={tx(
            `a11y_delivery_status_${
              status as Exclude<
                typeof status,
                // '' is not supposed to happen.
                // The others are not supposed to happen
                // as long as direction is outgoing.
                | ''
                | (typeof direction extends 'outgoing'
                    ? 'in_fresh' | 'in_seen' | 'in_noticed'
                    : never)
              >
            }`
          )}
          disabled={status !== 'error'}
          tabIndex={status === 'error' ? tabindexForInteractiveContents : -1}
          onClick={status === 'error' ? onClickError : undefined}
        />
      )}
    </div>
  )
}

/**
 * Returns true if message contains visual media (image, sticker or video)
 * without any further text.
 **/
export function isMediaWithoutText(
  fileMime: string | null,
  hasText: boolean,
  viewType: T.Viewtype
): boolean {
  const withImageNoCaption = Boolean(
    !hasText && (isImage(fileMime) || isVideo(fileMime))
  )

  return withImageNoCaption || viewType === 'Sticker'
}
