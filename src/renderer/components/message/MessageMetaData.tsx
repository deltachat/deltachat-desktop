import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import { isImage, isVideo } from '../attachment/Attachment'
import { i18nContext } from '../../contexts'
import { MessageType, msgStatus } from '../../../shared/shared-types'
import { AnchorButton } from '@blueprintjs/core/lib/esm/components/button/buttons'
import { Icon } from '@blueprintjs/core/lib/esm/components/icon/icon'

export default class MessageMetaData extends React.Component<{
  padlock: boolean
  username?: string
  file_mime?: string | null
  direction?: 'incoming' | 'outgoing'
  status: msgStatus
  text?: string
  timestamp: number
  hasLocation?: boolean
  replies?: (MessageType | null)[]
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
      replies = [],
      onClickError,
    } = this.props
    const replyCount= replies.length
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
            
            {!replyCount ? null :
              <AnchorButton small={true} minimal={true} style={{ marginLeft: 6, minHeight: 20, paddingRight: 6 }} className="bp3-round bp3-tag">
                <span className="bp3-icon" style={{ verticalAlign: "middle" }} >{replyCount.toFixed(0)}</span>
                <Icon icon="inheritance" iconSize={11} style={{ margin: 4, verticalAlign: "top" }} />
              </AnchorButton>
            }
          </div>
        )}
      </i18nContext.Consumer>
    )
  }
}
