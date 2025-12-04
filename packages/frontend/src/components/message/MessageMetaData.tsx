import React from 'react'
import classNames from 'classnames'
import { T } from '@deltachat/jsonrpc-client'

import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo } from '../attachment/Attachment'
import { msgStatus } from '../../types-app'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = {
  encrypted: boolean
  fileMime: string | null
  direction?: 'incoming' | 'outgoing'
  status: msgStatus
  error: string | null
  downloadState: T.DownloadState
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
    encrypted,
    fileMime,
    direction,
    status,
    error,
    downloadState,
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
      {/* FYI the email doesn't need `aria-live`
      as we don't expect it to get removed. See
      https://github.com/deltachat/deltachat-desktop/pull/5023#discussion_r2059382983 */}
      {!encrypted && downloadState === 'Done' && (
        // if a message is not yet downloaded we don't know if it is encrypted or not
        <div
          aria-label={tx('email')}
          // We should not announce this for _every_ message.
          // This is available in the "Message info" dialog.
          aria-hidden={true}
          className={'email-icon'}
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
      {(direction === 'outgoing' || error !== null) && (
        <div className='delivery-status-wrapper'>
          {/* The main point of `role='status'` here is to let the user know
          that their message has been sent or delievered
          right after they they send it.
          We want at least some indication of something happening
          after they press "Enter".
          But this is also useful to announce when the message has been read.

          Note that this this applies to _all_ loaded messages
          and not just the last one. */}
          {/* TODO a11y: we should probably apply `aria-label='Delivery status'`
          and change the contents to `Delivered` (or `Error` or whatever). */}
          <div
            role='status'
            className={classNames(
              'status-icon',
              error !== null ? 'error' : status
            )}
          >
            <span className='visually-hidden'>
              {tx(
                `a11y_delivery_status_${
                  error !== null
                    ? 'error'
                    : (status as Exclude<
                        typeof status,
                        // '' is not supposed to happen.
                        // The others are not supposed to happen
                        // as long as direction is outgoing.
                        '' | 'in_fresh' | 'in_seen' | 'in_noticed'
                      >)
                }`
              )}
            </span>
          </div>
          {error !== null && (
            <button
              type='button'
              className='error-button'
              tabIndex={tabindexForInteractiveContents}
              onClick={onClickError}
            >
              <span className='visually-hidden'>
                {tx('menu_message_details')}
              </span>
            </button>
          )}
        </div>
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
