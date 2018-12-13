const React = require('react')
const classNames = require('classnames')
const { MessageBody, Timestamp } = require('./conversations')
const ContactName = require('./ContactName')

class ChatListItem extends React.Component {
  renderAvatar () {
    const {
      avatarPath,
      color,
      name
    } = this.props

    if (!avatarPath) {
      let initial = name.trim()[0] || '#'

      return (
        <div
          style={{ 'backgroundColor': color }}
          className={classNames(
            'module-conversation-list-item__avatar',
            'module-conversation-list-item__default-avatar'
          )}
        >
          {initial}
        </div>
      )
    }

    return (
      <img
        className='module-conversation-list-item__avatar'
        src={avatarPath}
      />
    )
  }

  renderUnread () {
    const { unreadCount } = this.props

    if (unreadCount > 0) {
      return (
        <div className='module-conversation-list-item__unread-count'>
          {unreadCount}
        </div>
      )
    }

    return null
  }

  renderVerified () {
    if (this.props.isVerified) {
      return (
        <img
          className='module-conversation-list-item__is-verified'
          src='../images/verified.png'
        />
      )
    }

    return null
  }

  renderGroupIcon () {
    if (this.props.isGroup) {
      return (
        <img
          className='module-conversation-list-item__is-group'
          src='../images/group-icon.png'
        />
      )
    }

    return null
  }

  renderHeader () {
    const {
      unreadCount,
      i18n,
      lastUpdated,
      name,
      phoneNumber,
      profileName
    } = this.props

    return (
      <div className='module-conversation-list-item__header'>
        <div
          className={classNames(
            'module-conversation-list-item__header__name',
            unreadCount > 0
              ? 'module-conversation-list-item__header__name--with-unread'
              : null
          )}
        >
          {this.renderVerified()}
          {this.renderGroupIcon()}
          <ContactName
            phoneNumber={phoneNumber}
            name={name}
            profileName={profileName}
            i18n={i18n}
          />
        </div>
        <div
          className={classNames(
            'module-conversation-list-item__header__date',
            unreadCount > 0
              ? 'module-conversation-list-item__header__date--has-unread'
              : null
          )}
        >
          <Timestamp
            timestamp={lastUpdated}
            extended={false}
            module='module-conversation-list-item__header__timestamp'
            i18n={i18n}
          />
        </div>
      </div>
    )
  }

  renderMessage () {
    const { lastMessage, unreadCount, i18n } = this.props

    if (!lastMessage) {
      return null
    }

    return (
      <div className='module-conversation-list-item__message'>
        <div
          className={classNames(
            'module-conversation-list-item__message__text',
            unreadCount > 0
              ? 'module-conversation-list-item__message__text--has-unread'
              : null
          )}
        >
          <MessageBody
            text={lastMessage.text || ''}
            disableJumbomoji
            disableLinks
            i18n={i18n}
          />
        </div>
        {lastMessage.status ? (
          <div
            className={classNames(
              'module-conversation-list-item__message__status-icon',
              `module-conversation-list-item__message__status-icon--${
                lastMessage.status
              }`
            )}
          />
        ) : null}
        {this.renderUnread()}
      </div>
    )
  }

  render () {
    const { unreadCount, onClick, isSelected } = this.props

    return (
      <div
        role='button'
        onClick={onClick}
        className={classNames(
          'module-conversation-list-item',
          unreadCount > 0 ? 'module-conversation-list-item--has-unread' : null,
          isSelected ? 'module-conversation-list-item--is-selected' : null
        )}
      >
        {this.renderAvatar()}
        <div className='module-conversation-list-item__content'>
          {this.renderHeader()}
          {this.renderMessage()}
        </div>
      </div>
    )
  }
}

module.exports = ChatListItem
