import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo } from '../attachment/Attachment'
import { i18nContext } from '../../contexts'
import { msgStatus } from '../../../shared/shared-types'

export default class MessageMetaData extends React.Component<{
  padlock: boolean
  username?: string
  file_mime?: string | null
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
      file_mime,
      direction,
      status,
      text,
      timestamp,
      hasLocation,
      onClickError,
    } = this.props

    const withImageNoCaption = Boolean(
      !text && (isImage(file_mime || null) || isVideo(file_mime || null))
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
                onClick={status === 'error' ? onClickError : undefined}
              />
            ) : null}
          </div>
        )}
      </i18nContext.Consumer>
    )
  }
}
