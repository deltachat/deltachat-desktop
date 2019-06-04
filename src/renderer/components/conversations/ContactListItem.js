const React = require('react')
const classNames = require('classnames')

// TODO this function can be found in many places, refactor!
function getInitial (name) {
  return name.trim()[0] || '#'
}

class ContactListItem extends React.Component {
  renderAvatar ({ displayName }) {
    const { avatarPath, i18n, color, name } = this.props

    if (avatarPath) {
      return (
        <div className='module-contact-list-item__avatar'>
          <img alt={i18n('contactAvatarAlt', [displayName])} src={avatarPath} />
        </div>
      )
    }

    const title = name ? getInitial(name) : '#'

    return (
      <div
        className={classNames(
          'module-contact-list-item__avatar-default',
          `module-contact-list-item__avatar-default--${color}`
        )}
      >
        <div className='module-contact-list-item__avatar-default__label'>
          {title}
        </div>
      </div>
    )
  }

  render () {
    const {
      i18n,
      name,
      onClick,
      isMe,
      phoneNumber,
      profileName,
      verified
    } = this.props

    const title = name || phoneNumber
    const displayName = isMe ? i18n('me_desktop') : title

    const profileElement =
      !isMe && profileName && !name ? (
        <span className='module-contact-list-item__text__profile-name'>
          ~{profileName}
        </span>
      ) : null

    const showNumber = isMe || name
    const showVerified = !isMe && verified

    return (
      <div
        role='button'
        onClick={onClick}
        className={classNames(
          'module-contact-list-item',
          onClick ? 'module-contact-list-item--with-click-handler' : null
        )}
      >
        {this.renderAvatar({ displayName })}
        <div className='module-contact-list-item__text'>
          <div className='module-contact-list-item__text__name'>
            {displayName} {profileElement}
          </div>
          <div className='module-contact-list-item__text__additional-data'>
            {showVerified ? (
              <img className='module-contact-list-item__text__verified-icon' src='../images/verified.png' />
            ) : null}
            {showVerified ? ` ${i18n('verified_desktop')}` : null}
            {showVerified && showNumber ? ' ∙ ' : null}
            {showNumber ? phoneNumber : null}
          </div>
        </div>
      </div>
    )
  }
}

module.exports = ContactListItem
