const React = require('react')
const classNames = require('classnames')
const { ExpireTimer } = require('./ExpireTimer')
const Timestamp = require('./Timestamp')
const Attachment = require('../Attachment')

class MessageMetaData extends React.Component {
  render () {
    const {
      padlock,
      username,
      attachment,
      collapseMetadata,
      direction,
      expirationLength,
      expirationTimestamp,
      status,
      text,
      timestamp
    } = this.props
    const tx = window.translate

    if (collapseMetadata) {
      return null
    }

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
            className={classNames(
              'module-message__metadata__padlock-icon',
              `module-message__metadata__padlock-icon--${direction}`
            )}
          />
        ) : null}
        {showError ? (
          <span
            className={classNames(
              'module-message__metadata__date',
              `module-message__metadata__date--${direction}`,
              withImageNoCaption
                ? 'module-message__metadata__date--with-image-no-caption'
                : null
            )}
          >
            {tx('sendFailed')}
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
        {expirationLength && expirationTimestamp ? (
          <ExpireTimer
            direction={direction}
            expirationLength={expirationLength}
            expirationTimestamp={expirationTimestamp}
            withImageNoCaption={withImageNoCaption}
          />
        ) : null}
        <span className='module-message__metadata__spacer' />
        {direction === 'outgoing' && status !== 'error' ? (
          <div
            className={classNames(
              'module-message__metadata__status-icon',
              `module-message__metadata__status-icon--${status}`,
              withImageNoCaption
                ? 'module-message__metadata__status-icon--with-image-no-caption'
                : null
            )}
          />
        ) : null}
      </div>
    )
  }
}

module.exports = MessageMetaData
