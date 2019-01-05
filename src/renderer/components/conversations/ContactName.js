const React = require('react')
const Emojify = require('./Emojify')

class ContactName extends React.Component {
  render () {
    const { phoneNumber, name, profileName, i18n, module, color } = this.props
    const prefix = module || 'module-contact-name'

    const title = name || phoneNumber
    const shouldShowProfile = Boolean(profileName && !name)
    const profileElement = shouldShowProfile ? (
      <span className={`${prefix}__profile-name`} style={{ color: color }}>
        ~<Emojify text={profileName || ''} i18n={i18n} />
      </span>
    ) : null

    return (
      <span className={prefix} style={{ color: color }}>
        <Emojify text={title} i18n={i18n} />
        {shouldShowProfile ? ' ' : null}
        {profileElement}
      </span>
    )
  }
}

module.exports = ContactName
