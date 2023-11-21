import React from 'react'
import classNames from 'classnames'
import { T } from '@deltachat/jsonrpc-client'

import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo } from '../attachment/Attachment'
import { msgStatus } from '../../../shared/shared-types'
import { I18nContext } from '../../contexts/I18nContext'

export default class MessageMetaData extends React.Component<{
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
}> {
  render() {
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
    } = this.props

    const withImageNoCaption = Boolean(
      !hasText && (isImage(fileMime) || isVideo(fileMime))
    )

    return (
      <I18nContext.Consumer>
        {tx => (
          <div
            className={classNames('metadata', {
              'with-image-no-caption':
                withImageNoCaption || viewType === 'Sticker',
            })}
          >
            {username !== undefined ? (
              <div className='username'>{username}</div>
            ) : null}
            {padlock === true ? (
              <div
                aria-label={tx('a11y_encryption_padlock')}
                className={'padlock-icon'}
              />
            ) : null}
            {hasLocation ? <span className={'location-icon'} /> : null}
            <Timestamp
              timestamp={timestamp}
              extended
              direction={direction}
              module='date'
            />
            <span className='spacer' />
            {direction === 'outgoing' ? (
              <div
                className={classNames('status-icon', status)}
                aria-label={tx(`a11y_delivery_status_${status}`)}
                onClick={status === 'error' ? onClickError : undefined}
              />
            ) : null}
          </div>
        )}
      </I18nContext.Consumer>
    )
  }
}
