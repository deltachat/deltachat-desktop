import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo, hasAttachment } from '../attachment/Attachment'
import { i18nContext } from '../../contexts'
import { MessageTypeAttachment, msgStatus } from '../../../shared/shared-types'

export default class MessageMetaData extends React.Component<{
  padlock: boolean
  username?: string
  attachment?: MessageTypeAttachment
  direction?: 'incoming' | 'outgoing'
  status: msgStatus
  text?: string
  timestamp: number
  hasLocation?: boolean
  onClickError?: () => void
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
      onClickError,
    } = this.props

    const withImageNoCaption = Boolean(
      !text &&
        ((isImage(attachment) && hasAttachment(attachment)) ||
          isVideo(attachment))
    )

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
                onClick={status === 'error' && onClickError}
              />
            ) : null}
          </div>
        )}
      </i18nContext.Consumer>
    )
  }
}
