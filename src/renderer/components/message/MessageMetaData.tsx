import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo, hasAttachment } from '../attachment/Attachment'
import { i18nContext } from '../../contexts'
import { MessageTypeAttachment } from '../../../shared/shared-types'

export default class MessageMetaData extends React.Component<{
  padlock: boolean
  username?: string
  attachment?: MessageTypeAttachment
  direction?: 'incoming' | 'outgoing'
  status: 'error' | 'sending' | 'draft' | 'delivered' | 'read' | ''
  text?: string
  timestamp: number
  hasLocation?: boolean
}> {
  render() {
    const {
      padlock,
      username,
      attachment,
      direction,
      status,
      text,
      timestamp,
      hasLocation,
    } = this.props

    const withImageNoCaption = Boolean(
      !text &&
        ((isImage(attachment) && hasAttachment(attachment)) ||
          isVideo(attachment))
    )
    const showError = status === 'error' && direction === 'outgoing'

    return (
      <i18nContext.Consumer>
        {tx => (
          <div
            className={classNames('metadata', {
              'with-image-no-caption': withImageNoCaption,
            })}
          >
            {username !== undefined ? (
              <div className='username'>{username}</div>
            ) : null}
            {padlock === true && status !== 'error' ? (
              <div
                aria-label={tx('a11y_encryption_padlock')}
                className={'padlock-icon'}
              />
            ) : null}
            {hasLocation ? <span className={'location-icon'} /> : null}
            {showError ? (
              <span className='date' style={{ color: 'red' }}>
                {tx('send_failed')}
              </span>
            ) : (
              <Timestamp
                timestamp={timestamp}
                extended
                direction={direction}
                module='date'
              />
            )}
            <span className='spacer' />
            {direction === 'outgoing' ? (
              <div
                className={classNames('status-icon', status)}
                aria-label={tx(`a11y_delivery_status_${status}`)}
              />
            ) : null}
          </div>
        )}
      </i18nContext.Consumer>
    )
  }
}
