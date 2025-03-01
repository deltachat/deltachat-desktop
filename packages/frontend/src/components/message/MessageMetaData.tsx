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
      {padlock && (
        <div
          aria-label={tx('a11y_encryption_padlock')}
          className={'padlock-icon'}
        />
      )}
      {isSavedMessage && (
        <div aria-label={tx('saved')} className={'saved-message-icon'} />
      )}
      {hasLocation && <span className={'location-icon'} />}
      {isEdited && <span className='edited'>{tx('edited')}</span>}
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
          aria-label={tx(`a11y_delivery_status_${status}`)}
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
