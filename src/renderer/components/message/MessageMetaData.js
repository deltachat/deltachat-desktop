const React = require('react')
const classNames = require('classnames')
const Timestamp = require('../conversations/Timestamp')
const Attachment = require('./Attachment')

class MessageMetaData extends React.Component {
  render () {
    const {
      padlock,
      username,
      attachment,
      direction,
      status,
      text,
      timestamp
    } = this.props
    const tx = window.translate

    const withImageNoCaption = Boolean(
      !text &&
        ((Attachment.isImage(attachment) && Attachment.hasImage(attachment)) ||
          (Attachment.isVideo(attachment) && Attachment.hasVideoScreenshot(attachment)))
    )
    const showError = status === 'error' && direction === 'outgoing'

    return (
      <div
        className={classNames(
          'metadata',
          { 'with-image-no-caption': withImageNoCaption }
        )}
      >
        {username !== undefined ? (
          <div className='username' >{username}</div>
        ) : null}
        {padlock === true && status !== 'error' ? (
          <div
            aria-label={tx('a11y_encryption_padlock')}
            className={'padlock-icon'}
          />
        ) : null}
        {showError ? (
          <span
            className='date'
            style={{ color: 'red' }}
          >
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
            className={classNames(
              'status-icon',
              status
            )}
            aria-label={tx(`a11y_delivery_status_${status}`)}
          />
        ) : null}
      </div>
    )
  }
}

module.exports = MessageMetaData
