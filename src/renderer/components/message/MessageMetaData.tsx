import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo, hasAttachment } from '../attachment/Attachment'
import { i18nContext } from '../../contexts'
import { MessageAttachment, MessageState } from '../../../shared/shared-types'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'

export default class MessageMetaData extends React.Component<{
  padlock: boolean
  username?: string
  attachment?: MessageAttachment
  direction?: 'incoming' | 'outgoing'
  state: MessageState
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
      state,
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

    const messageStateString = mapCoreMsgStatus2String(state)
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
                className={classNames('status-icon', messageStateString)}
                aria-label={tx(`a11y_delivery_status_${messageStateString}`)}
                onClick={
                  messageStateString === 'error' ? onClickError : undefined
                }
              />
            ) : null}
          </div>
        )}
      </i18nContext.Consumer>
    )
  }
}
