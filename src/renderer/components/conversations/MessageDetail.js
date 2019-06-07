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
    const tx = window.translate
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
        alt={tx('contactAvatarAlt', [title])}
        src={avatarPath}
      />
    )
  }

  renderDeleteButton () {
    const { message } = this.props
    const tx = window.translate

    return (
      <div className='module-message-detail__delete-button-container'>
        <button
          onClick={message.onDelete}
          className='module-message-detail__delete-button'
        >
          {tx('delete_message_desktop')}
        </button>
      </div>
    )
  }

  renderContact (contact) {
    const tx = window.translate
    const errors = contact.errors || []

    const errorComponent = contact.isOutgoingKeyError ? (
      <div className='module-message-detail__contact__error-buttons'>
        <button
          className='module-message-detail__contact__show-safety-number'
          onClick={contact.onShowSafetyNumber}
        >
          {tx('showSafetyNumber')}
        </button>
        <button
          className='module-message-detail__contact__send-anyway'
          onClick={contact.onSendAnyway}
        >
          {tx('sendAnyway')}
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
    const { errors, message, receivedAt, sentAt } = this.props
    const tx = window.translate

    return (
      <div className='module-message-detail'>
        <div className='module-message-detail__message-container'>
          <Message {...message} />
        </div>
        <table className='module-message-detail__info'>
          <tbody>
            {(errors || []).map((error, index) => (
              <tr key={message.id}>
                <td className='module-message-detail__label'>
                  {tx('error')}
                </td>
                <td>
                  {' '}
                  <span className='error-message'>{error.message}</span>{' '}
                </td>
              </tr>
            ))}
            <tr>
              <td className='module-message-detail__label'>{tx('message_detail_sent_desktop')}</td>
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
                  {tx('message_detail_received_desktop')}
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
                {message.direction === 'incoming' ? tx('message_detail_from_desktop') : tx('message_detail_to_desktop')}
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
