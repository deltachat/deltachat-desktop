const React = require('react')

class ContactName extends React.Component {
  render () {
    const { phoneNumber, name, profileName, module, color } = this.props
    const prefix = module || 'module-contact-name'

    const title = name || phoneNumber
    const shouldShowProfile = Boolean(profileName && !name)
    const profileElement = shouldShowProfile ? (
      <span className={`${prefix}__profile-name`} style={{ color: color }}>
        ~{profileName || ''}
      </span>
    ) : null

    return (
      <span className={prefix} style={{ color: color }}>
        {title}
        {shouldShowProfile ? ' ' : null}
        {profileElement}
      </span>
    )
  }
}

module.exports = ContactName
