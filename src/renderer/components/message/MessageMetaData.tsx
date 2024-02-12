import React from 'react'
import classNames from 'classnames'
import { T } from '@deltachat/jsonrpc-client'

import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo } from '../attachment/Attachment'
import { msgStatus } from '../../../shared/shared-types'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = {
  padlock: boolean
  username?: string
  fileMime: string | null
  direction?: 'incoming' | 'outgoing'
  status: msgStatus
  hasText: boolean
  timestamp: number
  hasLocation?: boolean
  onClickError?: () => void
  viewType: T.Viewtype
}

export default function MessageMetaData(props: Props) {
  const tx = useTranslationFunction()

  const {
    padlock,
    username,
    fileMime,
    direction,
    status,
    hasText,
    timestamp,
    hasLocation,
    onClickError,
    viewType,
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
      {username && <div className='username'>{username}</div>}
      {padlock && (
        <div
          aria-label={tx('a11y_encryption_padlock')}
          className={'padlock-icon'}
        />
      )}
      {hasLocation && <span className={'location-icon'} />}
      <Timestamp
        timestamp={timestamp}
        extended
        direction={direction}
        module='date'
      />
      <span className='spacer' />
      {direction === 'outgoing' && (
        <div
          className={classNames('status-icon', status)}
          aria-label={tx(`a11y_delivery_status_${status}`)}
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
