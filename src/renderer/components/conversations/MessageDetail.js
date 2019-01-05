const React = require('react')
const classNames = require('classnames')
const moment = require('moment')
const ContactName = require('./ContactName')
const Message = require('./Message')

function getInitial (name) {
  return name.trim()[0] || '#'
}

class MessageDetail extends React.Component {
  renderAvatar (contact) {
    const { i18n } = this.props
    const { avatarPath, color, phoneNumber, name, profileName } = contact

    if (!avatarPath) {
      const initial = getInitial(name || '')

      return (
        <div
          className={classNames(
            'module-message-detail__contact__avatar',
            'module-message-detail__contact__default-avatar',
            `module-message-detail__contact__default-avatar--${color}`
          )}
        >
          {initial}
        </div>
      )
    }

    const title = `${name || phoneNumber}${
      !name && profileName ? ` ~${profileName}` : ''
    }`

    return (
      <img
        className='module-message-detail__contact__avatar'
        alt={i18n('contactAvatarAlt', [title])}
        src={avatarPath}
      />
    )
  }

  renderDeleteButton () {
    const { i18n, message } = this.props

    return (
      <div className='module-message-detail__delete-button-container'>
        <button
          onClick={message.onDelete}
          className='module-message-detail__delete-button'
        >
          {i18n('delete_message_desktop')}
        </button>
      </div>
    )
  }

  renderContact (contact) {
    const { i18n } = this.props
    const errors = contact.errors || []

    const errorComponent = contact.isOutgoingKeyError ? (
      <div className='module-message-detail__contact__error-buttons'>
        <button
          className='module-message-detail__contact__show-safety-number'
          onClick={contact.onShowSafetyNumber}
        >
          {i18n('showSafetyNumber')}
        </button>
        <button
          className='module-message-detail__contact__send-anyway'
          onClick={contact.onSendAnyway}
        >
          {i18n('sendAnyway')}
        </button>
      </div>
    ) : null
    const statusComponent = !contact.isOutgoingKeyError ? (
      <div
        className={classNames(
          'module-message-detail__contact__status-icon',
          `module-message-detail__contact__status-icon--${contact.status}`
        )}
      />
    ) : null

    return (
      <div key={contact.phoneNumber} className='module-message-detail__contact'>
        {this.renderAvatar(contact)}
        <div className='module-message-detail__contact__text'>
          <div className='module-message-detail__contact__name'>
            <ContactName
              phoneNumber={contact.phoneNumber}
              name={contact.name}
              profileName={contact.profileName}
              i18n={i18n}
            />
          </div>
          {errors.map((error, index) => (
            <div key={index} className='module-message-detail__contact__error'>
              {error.message}
            </div>
          ))}
        </div>
        {errorComponent}
        {statusComponent}
      </div>
    )
  }

  renderContacts () {
    const { contacts } = this.props

    if (!contacts || !contacts.length) {
      return null
    }

    return (
      <div className='module-message-detail__contact-container'>
        {contacts.map(contact => this.renderContact(contact))}
      </div>
    )
  }

  render () {
    const { errors, message, receivedAt, sentAt, i18n } = this.props

    return (
      <div className='module-message-detail'>
        <div className='module-message-detail__message-container'>
          <Message i18n={i18n} {...message} />
        </div>
        <table className='module-message-detail__info'>
          <tbody>
            {(errors || []).map((error, index) => (
              <tr key={index}>
                <td className='module-message-detail__label'>
                  {i18n('error')}
                </td>
                <td>
                  {' '}
                  <span className='error-message'>{error.message}</span>{' '}
                </td>
              </tr>
            ))}
            <tr>
              <td className='module-message-detail__label'>{i18n('sent')}</td>
              <td>
                {moment(sentAt).format('LLLL')}{' '}
                <span className='module-message-detail__unix-timestamp'>
                  ({sentAt})
                </span>
              </td>
            </tr>
            {receivedAt ? (
              <tr>
                <td className='module-message-detail__label'>
                  {i18n('received')}
                </td>
                <td>
                  {moment(receivedAt).format('LLLL')}{' '}
                  <span className='module-message-detail__unix-timestamp'>
                    ({receivedAt})
                  </span>
                </td>
              </tr>
            ) : null}
            <tr>
              <td className='module-message-detail__label'>
                {message.direction === 'incoming' ? i18n('from') : i18n('to')}
              </td>
            </tr>
          </tbody>
        </table>
        {this.renderContacts()}
        {this.renderDeleteButton()}
      </div>
    )
  }
}

module.exports = MessageDetail
