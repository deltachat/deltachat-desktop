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
          'module-message__metadata',
          withImageNoCaption
            ? 'module-message__metadata--with-image-no-caption'
            : null
        )}
      >
        {username !== undefined ? (
          <div className={'module-message__metadata--username'} >{username}</div>
        ) : null}
        {padlock === true && status !== 'error' ? (
          <div
            aria-label={tx('a11y_encryption_padlock')}
            className={'module-message__metadata__padlock-icon'}
          />
        ) : null}
        {showError ? (
          <span
            className={classNames(
              'module-message__metadata__date',
              withImageNoCaption
                ? 'module-message__metadata__date--with-image-no-caption'
                : null
            )}
            style={{ color: 'red' }}
          >
            {tx('send_failed')}
          </span>
        ) : (
          <Timestamp
            timestamp={timestamp}
            extended
            direction={direction}
            withImageNoCaption={withImageNoCaption}
            module='module-message__metadata__date'
          />
        )}
        <span className='module-message__metadata__spacer' />
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
