import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import {
  isImage,
  isVideo,
  hasVideoScreenshot,
  hasImage,
  attachment,
} from '../attachment/Attachment'

export default class MessageMetaData extends React.Component<{
  padlock: boolean
  username: todo
  attachment?: attachment
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
    const tx = window.translate

    const withImageNoCaption = Boolean(
      !text &&
        ((isImage(attachment) && hasImage(attachment)) ||
          (isVideo(attachment) && hasVideoScreenshot(attachment)))
    )
    const showError = status === 'error' && direction === 'outgoing'

    return (
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
    )
  }
}
