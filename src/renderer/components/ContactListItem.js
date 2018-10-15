const React = require('react')
const { ContactListItem } = require('./conversations')

module.exports = function (props) {
  const contact = props.contact
  const oldOnClick = props.onClick
  var onClick = function (event) {
    if (oldOnClick) oldOnClick(contact)
  }
  var outgoingProps = {
    onClick: onClick,
    name: contact.name,
    phoneNumber: contact.address,
    avatarPath: contact.profileImage,
    profileName: contact.displayName,
    isMe: contact.displayName === 'Me',
    verified: contact.verified,
    color: props.color
  }

  return (<ContactListItem {...outgoingProps} />)
}
